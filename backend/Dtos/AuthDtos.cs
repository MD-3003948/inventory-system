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
    int PrivilegeLevel,
    bool MustChangePassword
);

public record CurrentUserResponse(
    string UserCode,
    string FirstName,
    string LastName,
    string Username,
    string Organization,
    int PrivilegeLevel,
    string? DepartmentName,
    DateTimeOffset? LastLoginAt,
    DateTimeOffset CreatedAt,
    bool MustChangePassword
);

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
