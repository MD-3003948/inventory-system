using System.Security.Claims;

namespace InventorySystem.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetOrganizationId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue("organization_id");
        if (value is null || !int.TryParse(value, out var organizationId))
        {
            throw new InvalidOperationException("Token is missing the organization_id claim.");
        }

        return organizationId;
    }

    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (value is null || !int.TryParse(value, out var userId))
        {
            throw new InvalidOperationException("Token is missing the user id claim.");
        }

        return userId;
    }

    public static int GetPrivilegeLevel(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue("privilege_level");
        if (value is null || !int.TryParse(value, out var privilegeLevel))
        {
            throw new InvalidOperationException("Token is missing the privilege_level claim.");
        }

        return privilegeLevel;
    }

    // Privilege level 0 is the Admin tier - see PrivilegeLevel seeding in Program.cs.
    public static bool IsAdmin(this ClaimsPrincipal user) => user.GetPrivilegeLevel() == 0;
}
