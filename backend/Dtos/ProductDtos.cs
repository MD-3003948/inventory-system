using System.ComponentModel.DataAnnotations;

namespace InventorySystem.Api.Dtos;

public record ProductResponse(
    int Id,
    string Sku,
    string Name,
    string Description,
    int Quantity,
    decimal UnitPrice,
    int PartCategoryId,
    string PartCategoryName,
    int PartSubCategoryId,
    string PartSubCategoryName,
    int? AttributeTemplateId,
    string? AttributeTemplateName,
    int CustomerCategoryId,
    string CustomerCategoryName,
    int? AssignedCustomerId,
    string? AssignedCustomerName,
    string? ImageUrl,
    int CreatedByUserId,
    string CreatedByUserName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

// Bound from multipart/form-data so the image can be uploaded in the same request as the rest
// of the product fields.
public class ProductCreateRequest
{
    [Required, MaxLength(64)]
    public string Sku { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int PartCategoryId { get; set; }

    [Required]
    public int PartSubCategoryId { get; set; }

    public int? AttributeTemplateId { get; set; }

    [Required]
    public int CustomerCategoryId { get; set; }

    public int? AssignedCustomerId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }

    public IFormFile? Image { get; set; }
}

public class ProductUpdateRequest
{
    [Required, MaxLength(64)]
    public string Sku { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int PartCategoryId { get; set; }

    [Required]
    public int PartSubCategoryId { get; set; }

    public int? AttributeTemplateId { get; set; }

    [Required]
    public int CustomerCategoryId { get; set; }

    public int? AssignedCustomerId { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }
}
