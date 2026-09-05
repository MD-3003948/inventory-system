using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];
    private const long MaxImageBytes = 10 * 1024 * 1024;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAll(
        [FromQuery] string? sku,
        [FromQuery] int? partCategoryId,
        [FromQuery] int? partSubCategoryId,
        [FromQuery] int? assignedCustomerId,
        [FromQuery] int? departmentId)
    {
        var orgId = User.GetOrganizationId();
        var query = WithIncludes().Where(p => p.OrganizationId == orgId);

        if (!string.IsNullOrWhiteSpace(sku))
        {
            query = query.Where(p => EF.Functions.ILike(p.Sku, $"%{sku}%"));
        }
        if (partCategoryId.HasValue)
        {
            query = query.Where(p => p.PartCategoryId == partCategoryId.Value);
        }
        if (partSubCategoryId.HasValue)
        {
            query = query.Where(p => p.PartSubCategoryId == partSubCategoryId.Value);
        }
        if (assignedCustomerId.HasValue)
        {
            query = query.Where(p => p.AssignedCustomerId == assignedCustomerId.Value);
        }
        if (departmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == departmentId.Value);
        }

        var products = await query.OrderBy(p => p.Name).ToListAsync();
        return Ok(products.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetById(int id)
    {
        var orgId = User.GetOrganizationId();
        var product = await WithIncludes().FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == orgId);
        if (product is null) return NotFound();

        return Ok(ToResponse(product));
    }

    [HttpPost]
    [RequestSizeLimit(MaxImageBytes + 1024 * 1024)]
    public async Task<ActionResult<ProductResponse>> Create([FromForm] ProductCreateRequest request)
    {
        var orgId = User.GetOrganizationId();

        var lookupError = await ValidateLookupsAsync(orgId, request.PartCategoryId, request.PartSubCategoryId,
            request.CustomerCategoryId, request.AttributeTemplateId, request.AssignedCustomerId, request.DepartmentId);
        if (lookupError is not null) return BadRequest(lookupError);

        string? imagePath = null;
        if (request.Image is not null && request.Image.Length > 0)
        {
            var imageError = ValidateImage(request.Image);
            if (imageError is not null) return BadRequest(imageError);
            imagePath = await SaveImageAsync(request.Image);
        }

        var now = DateTimeOffset.UtcNow;
        var product = new Product
        {
            Sku = request.Sku,
            Name = request.Name,
            Description = request.Description,
            Quantity = 0,
            UnitPrice = request.UnitPrice,
            PartCategoryId = request.PartCategoryId,
            PartSubCategoryId = request.PartSubCategoryId,
            AttributeTemplateId = request.AttributeTemplateId,
            CustomerCategoryId = request.CustomerCategoryId,
            AssignedCustomerId = request.AssignedCustomerId,
            DepartmentId = request.DepartmentId,
            ImagePath = imagePath,
            CreatedByUserId = User.GetUserId(),
            OrganizationId = orgId,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        var full = await WithIncludes().FirstAsync(p => p.Id == product.Id);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, ToResponse(full));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponse>> Update(int id, ProductUpdateRequest request)
    {
        var orgId = User.GetOrganizationId();
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == orgId);
        if (product is null) return NotFound();

        var lookupError = await ValidateLookupsAsync(orgId, request.PartCategoryId, request.PartSubCategoryId,
            request.CustomerCategoryId, request.AttributeTemplateId, request.AssignedCustomerId, request.DepartmentId);
        if (lookupError is not null) return BadRequest(lookupError);

        product.Sku = request.Sku;
        product.Name = request.Name;
        product.Description = request.Description;
        product.Quantity = request.Quantity;
        product.UnitPrice = request.UnitPrice;
        product.PartCategoryId = request.PartCategoryId;
        product.PartSubCategoryId = request.PartSubCategoryId;
        product.AttributeTemplateId = request.AttributeTemplateId;
        product.CustomerCategoryId = request.CustomerCategoryId;
        product.AssignedCustomerId = request.AssignedCustomerId;
        product.DepartmentId = request.DepartmentId;
        product.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        var full = await WithIncludes().FirstAsync(p => p.Id == product.Id);
        return Ok(ToResponse(full));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var orgId = User.GetOrganizationId();
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == orgId);
        if (product is null) return NotFound();

        db.Products.Remove(product);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<string?> ValidateLookupsAsync(
        int orgId, int partCategoryId, int partSubCategoryId, int customerCategoryId,
        int? attributeTemplateId, int? assignedCustomerId, int? departmentId)
    {
        var partCategoryOk = await db.PartCategories.AnyAsync(c => c.Id == partCategoryId && c.OrganizationId == orgId);
        if (!partCategoryOk) return "Invalid part category.";

        var partSubCategoryOk = await db.PartSubCategories.AnyAsync(c =>
            c.Id == partSubCategoryId && c.OrganizationId == orgId && c.PartCategoryId == partCategoryId);
        if (!partSubCategoryOk) return "Invalid part sub-category.";

        var customerCategoryOk = await db.CustomerCategories.AnyAsync(c => c.Id == customerCategoryId && c.OrganizationId == orgId);
        if (!customerCategoryOk) return "Invalid customer category.";

        if (attributeTemplateId.HasValue)
        {
            var templateOk = await db.AttributeTemplates.AnyAsync(t => t.Id == attributeTemplateId && t.OrganizationId == orgId);
            if (!templateOk) return "Invalid attribute template.";
        }

        if (assignedCustomerId.HasValue)
        {
            var customerOk = await db.Customers.AnyAsync(c => c.Id == assignedCustomerId && c.OrganizationId == orgId);
            if (!customerOk) return "Invalid assigned customer.";
        }

        if (departmentId.HasValue)
        {
            var departmentOk = await db.Departments.AnyAsync(d => d.Id == departmentId && d.OrganizationId == orgId);
            if (!departmentOk) return "Invalid department.";
        }

        return null;
    }

    private static string? ValidateImage(IFormFile image)
    {
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return "Unsupported file type. Allowed: jpg, png, gif, webp, pdf.";
        }
        if (image.Length > MaxImageBytes)
        {
            return "File too large (max 10MB).";
        }

        return null;
    }

    private async Task<string> SaveImageAsync(IFormFile image)
    {
        var uploadsRoot = Path.Combine(env.ContentRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsRoot);

        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await image.CopyToAsync(stream);

        return $"products/{fileName}";
    }

    private IQueryable<Product> WithIncludes() =>
        db.Products
            .Include(p => p.PartCategory)
            .Include(p => p.PartSubCategory)
            .Include(p => p.AttributeTemplate)
            .Include(p => p.CustomerCategory)
            .Include(p => p.AssignedCustomer)
            .Include(p => p.Department)
            .Include(p => p.CreatedByUser);

    private static ProductResponse ToResponse(Product p) => new(
        p.Id, p.Sku, p.Name, p.Description, p.Quantity, p.UnitPrice,
        p.PartCategoryId, p.PartCategory?.Name ?? string.Empty,
        p.PartSubCategoryId, p.PartSubCategory?.Name ?? string.Empty,
        p.AttributeTemplateId, p.AttributeTemplate?.Name,
        p.CustomerCategoryId, p.CustomerCategory?.Name ?? string.Empty,
        p.AssignedCustomerId, p.AssignedCustomer?.Name,
        p.DepartmentId, p.Department?.Name,
        p.ImagePath is null ? null : $"/api/uploads/{p.ImagePath}",
        p.CreatedByUserId, p.CreatedByUser?.Username ?? string.Empty,
        p.CreatedAt, p.UpdatedAt
    );
}
