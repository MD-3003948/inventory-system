namespace InventorySystem.Api.Models;

public static class PasswordGenerator
{
    // Excludes visually-ambiguous characters (0/O, 1/l/I) so a temporary password
    // handed to a new user is easy to read and retype correctly.
    private const string Chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    public static string Generate(int length = 12)
    {
        var chars = new char[length];
        for (var i = 0; i < length; i++)
        {
            chars[i] = Chars[Random.Shared.Next(Chars.Length)];
        }

        return new string(chars);
    }
}
