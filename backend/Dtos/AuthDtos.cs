using System.ComponentModel.DataAnnotations;

namespace InventorySystem.Api.Dtos;

public class LoginRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public record LoginResponse(
    string Token,
    string UserCode,
    string FirstName,
    string LastName,
    int PrivilegeLevel
);

public record CurrentUserResponse(
    string UserCode,
    string FirstName,
    string LastName,
    string Username,
    string Organization,
    int PrivilegeLevel,
    DateTimeOffset? LastLoginAt
);
