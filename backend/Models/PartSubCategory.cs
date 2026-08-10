namespace InventorySystem.Api.Models;

public class PartSubCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int PartCategoryId { get; set; }
    public PartCategory? PartCategory { get; set; }
    public int OrganizationId { get; set; }
    public Organization? Organization { get; set; }
}
