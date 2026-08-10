namespace InventorySystem.Api.Models;

public class PartCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public List<PartSubCategory> SubCategories { get; set; } = [];
}
