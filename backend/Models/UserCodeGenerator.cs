using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;

namespace InventorySystem.Api.Models;

public static class UserCodeGenerator
{
    // UserCode is globally unique (see AppDbContext), so the collision check
    // isn't scoped to one organization.
    public static string Generate(AppDbContext db, int privilegeLevel)
    {
        var prefix = privilegeLevel switch
        {
            0 => "ADMIN-",
            1 => "MAN-",
            _ => "EMP-",
        };

        var random = new Random();
        string code;
        do
        {
            code = $"{prefix}{random.Next(0, 1_000_000):D6}";
        } while (db.Users.Any(u => u.UserCode == code));

        return code;
    }
}
