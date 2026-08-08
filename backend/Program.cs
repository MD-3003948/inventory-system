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
            Organization = "Platform",
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
            new Customer { Name = "Acme Manufacturing", Email = "purchasing@acme.example", Phone = "555-0101", Company = "Acme Manufacturing", CreatedAt = DateTimeOffset.UtcNow },
            new Customer { Name = "Bluepeak Logistics", Email = "orders@bluepeak.example", Phone = "555-0102", Company = "Bluepeak Logistics", CreatedAt = DateTimeOffset.UtcNow },
            new Customer { Name = "Desert Retail Co.", Email = "buying@desertretail.example", Phone = "555-0103", Company = "Desert Retail Co.", CreatedAt = DateTimeOffset.UtcNow }
        );
        db.SaveChanges();
    }

    if (!db.SalesOrders.Any() && db.InventoryItems.Any())
    {
        var items = db.InventoryItems.Take(3).ToList();
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

            foreach (var item in items.Take(rng.Next(1, items.Count + 1)))
            {
                order.LineItems.Add(new OrderLineItem
                {
                    InventoryItemId = item.Id,
                    Quantity = rng.Next(1, 5),
                    UnitPriceAtSale = item.UnitPrice,
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

app.MapControllers();

app.Run();
