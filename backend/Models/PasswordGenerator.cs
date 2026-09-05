namespace InventorySystem.Api.Models;

public static class PasswordGenerator
{
    // Excludes visually-ambiguous characters (0/O, 1/l/I) so a temporary password
    // handed to a new user is easy to read and retype correctly.
    private const string Uppercase = "ABCDEFGHJKMNPQRSTUVWXYZ";
    private const string Lowercase = "abcdefghijkmnpqrstuvwxyz";
    private const string Digits = "23456789";
    private const string Symbols = "!@#$%^&*-_=+";
    private const string AllChars = Uppercase + Lowercase + Digits + Symbols;

    // Guarantees at least one character from every class PasswordPolicy requires,
    // so a generated temporary password always satisfies the same policy a user's
    // self-chosen password would need to.
    public static string Generate(int length = 16)
    {
        var chars = new char[length];
        chars[0] = Uppercase[Random.Shared.Next(Uppercase.Length)];
        chars[1] = Lowercase[Random.Shared.Next(Lowercase.Length)];
        chars[2] = Digits[Random.Shared.Next(Digits.Length)];
        chars[3] = Symbols[Random.Shared.Next(Symbols.Length)];

        for (var i = 4; i < length; i++)
        {
            chars[i] = AllChars[Random.Shared.Next(AllChars.Length)];
        }

        for (var i = chars.Length - 1; i > 0; i--)
        {
            var j = Random.Shared.Next(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }

        return new string(chars);
    }
}
