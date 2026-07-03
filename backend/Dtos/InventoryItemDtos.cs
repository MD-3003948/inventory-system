using System.ComponentModel.DataAnnotations;

namespace InventorySystem.Api.Dtos;

public record InventoryItemResponse(
    int Id,
    string Name,
    string Sku,
    string Category,
    int Quantity,
    decimal UnitPrice,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public class InventoryItemRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(64)]
    public string Sku { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }
}
