namespace InventorySystem.Api.Models;

// Placeholder entity for now - just a name to populate the dropdown.
// The actual attribute-definition builder is a future phase.
public class AttributeTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrganizationId { get; set; }
    public Organization? Organization { get; set; }
}
