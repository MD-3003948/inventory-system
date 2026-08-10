namespace InventorySystem.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    public int OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public List<SalesOrder> Orders { get; set; } = [];
}
