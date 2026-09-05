using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using InventorySystem.Api.Data;
using InventorySystem.Api.Models;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCors";

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the token returned from /api/auth/login (no 'Bearer ' prefix needed here)."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // The migration always creates the first organization row (and backfills any
    // pre-existing data onto it), so it's guaranteed to exist by the time we get here.
    // Matched by position rather than name/code, since both can be renamed later.
    var defaultOrg = db.Organizations.OrderBy(o => o.Id).First();

    if (!db.Users.Any())
    {
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var adminUsername = config["InitialAdmin:Username"]!;
        var adminPassword = config["InitialAdmin:Password"]!;

        var admin = new User
        {
            UserCode = "ADMIN-001",
            FirstName = "Admin",
            LastName = "User",
            Username = adminUsername,
            OrganizationId = defaultOrg.Id,
            PrivilegeLevel = 0,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, adminPassword);

        db.Users.Add(admin);
        db.SaveChanges();
    }

    if (!db.Customers.Any())
    {
        db.Customers.AddRange(
            new Customer { Name = "Acme Manufacturing", Email = "purchasing@acme.example", Phone = "555-0101", Company = "Acme Manufacturing", CreatedAt = DateTimeOffset.UtcNow, OrganizationId = defaultOrg.Id },
            new Customer { Name = "Bluepeak Logistics", Email = "orders@bluepeak.example", Phone = "555-0102", Company = "Bluepeak Logistics", CreatedAt = DateTimeOffset.UtcNow, OrganizationId = defaultOrg.Id },
            new Customer { Name = "Desert Retail Co.", Email = "buying@desertretail.example", Phone = "555-0103", Company = "Desert Retail Co.", CreatedAt = DateTimeOffset.UtcNow, OrganizationId = defaultOrg.Id }
        );
        db.SaveChanges();
    }

    if (!db.PartCategories.Any(c => c.Name == "Hardware"))
    {
        var hardware = new PartCategory { Name = "Hardware", OrganizationId = defaultOrg.Id };
        var electronics = new PartCategory { Name = "Electronics", OrganizationId = defaultOrg.Id };
        db.PartCategories.AddRange(hardware, electronics);
        db.SaveChanges();

        db.PartSubCategories.AddRange(
            new PartSubCategory { Name = "Fasteners", PartCategoryId = hardware.Id, OrganizationId = defaultOrg.Id },
            new PartSubCategory { Name = "Brackets", PartCategoryId = hardware.Id, OrganizationId = defaultOrg.Id },
            new PartSubCategory { Name = "Passive Components", PartCategoryId = electronics.Id, OrganizationId = defaultOrg.Id },
            new PartSubCategory { Name = "Connectors", PartCategoryId = electronics.Id, OrganizationId = defaultOrg.Id }
        );
        db.SaveChanges();
    }

    if (!db.Departments.Any(d => d.Name == "Operations"))
    {
        db.Departments.AddRange(
            new Department { Name = "Operations", OrganizationId = defaultOrg.Id },
            new Department { Name = "Sales", OrganizationId = defaultOrg.Id }
        );
        db.SaveChanges();
    }

    if (!db.CustomerCategories.Any(c => c.Name == "OEM"))
    {
        db.CustomerCategories.AddRange(
            new CustomerCategory { Name = "OEM", OrganizationId = defaultOrg.Id },
            new CustomerCategory { Name = "Distributor", OrganizationId = defaultOrg.Id },
            new CustomerCategory { Name = "Retail", OrganizationId = defaultOrg.Id }
        );
        db.SaveChanges();
    }

    if (!db.AttributeTemplates.Any(t => t.Name == "Standard Part"))
    {
        db.AttributeTemplates.AddRange(
            new AttributeTemplate { Name = "Standard Part", OrganizationId = defaultOrg.Id },
            new AttributeTemplate { Name = "Fastener Template", OrganizationId = defaultOrg.Id },
            new AttributeTemplate { Name = "Electronic Component", OrganizationId = defaultOrg.Id }
        );
        db.SaveChanges();
    }

    if (!db.SalesOrders.Any() && db.Products.Any())
    {
        var products = db.Products.Take(3).ToList();
        var customers = db.Customers.Take(3).ToList();
        var rng = new Random();

        for (var i = 0; i < customers.Count; i++)
        {
            var order = new SalesOrder
            {
                CustomerId = customers[i].Id,
                Status = i == 0 ? SalesOrderStatus.Completed : SalesOrderStatus.Pending,
                OrderDate = DateTimeOffset.UtcNow.AddDays(-rng.Next(1, 20)),
                OrderNumber = "PENDING",
            };

            foreach (var product in products.Take(rng.Next(1, products.Count + 1)))
            {
                order.LineItems.Add(new OrderLineItem
                {
                    ProductId = product.Id,
                    Quantity = rng.Next(1, 5),
                    UnitPriceAtSale = product.UnitPrice,
                });
            }

            db.SalesOrders.Add(order);
            db.SaveChanges();
            order.OrderNumber = $"SO-{order.Id:D6}";
        }

        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

// Serve uploaded product images/drawings under /api/uploads so the existing Caddy
// "/api/* -> backend" production routing rule covers it with zero Caddyfile changes.
var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsRoot);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsRoot),
    RequestPath = "/api/uploads",
});

app.MapControllers();

app.Run();
