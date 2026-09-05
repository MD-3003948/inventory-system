namespace InventorySystem.Api.Models;

// Enforced whenever a password is set (change-password), not on login - retroactively
// invalidating existing passwords isn't how current guidance recommends rolling out a
// stronger policy.
public static class PasswordPolicy
{
    public const int MinLength = 12;
    public const int MaxLength = 128;

    public static string? Validate(string password)
    {
        if (password.Length < MinLength)
        {
            return $"Password must be at least {MinLength} characters long.";
        }
        if (password.Length > MaxLength)
        {
            return $"Password must be at most {MaxLength} characters long.";
        }
        if (!password.Any(char.IsUpper))
        {
            return "Password must contain at least one uppercase letter.";
        }
        if (!password.Any(char.IsLower))
        {
            return "Password must contain at least one lowercase letter.";
        }
        if (!password.Any(char.IsDigit))
        {
            return "Password must contain at least one number.";
        }
        if (!password.Any(c => !char.IsLetterOrDigit(c)))
        {
            return "Password must contain at least one special character.";
        }

        return null;
    }
}
