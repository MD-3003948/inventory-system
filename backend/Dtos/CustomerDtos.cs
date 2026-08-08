using System.ComponentModel.DataAnnotations;

namespace InventorySystem.Api.Dtos;

public record CustomerResponse(
    int Id,
    string Name,
    string Email,
    string Phone,
    string Company,
    DateTimeOffset CreatedAt
);

public class CustomerRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(32)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Company { get; set; } = string.Empty;
}
