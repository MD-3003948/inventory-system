namespace InventorySystem.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public int PartCategoryId { get; set; }
    public PartCategory? PartCategory { get; set; }

    public int PartSubCategoryId { get; set; }
    public PartSubCategory? PartSubCategory { get; set; }

    public int? AttributeTemplateId { get; set; }
    public AttributeTemplate? AttributeTemplate { get; set; }

    public int CustomerCategoryId { get; set; }
    public CustomerCategory? CustomerCategory { get; set; }

    public int? DepartmentId { get; set; }
    public Department? Department { get; set; }

    // The specific customer this part is dedicated to, if any - distinct from CustomerCategory,
    // which is a broader market segment/tier rather than one specific customer.
    public int? AssignedCustomerId { get; set; }
    public Customer? AssignedCustomer { get; set; }

    public string? ImagePath { get; set; }

    public int CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public int OrganizationId { get; set; }
    public Organization? Organization { get; set; }
}
