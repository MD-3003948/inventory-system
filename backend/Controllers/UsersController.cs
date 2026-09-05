using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
    private static readonly PasswordHasher<User> PasswordHasher = new();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ManagedUserResponse>>> GetAll()
    {
        if (!User.IsAdmin()) return Forbid();

        var orgId = User.GetOrganizationId();
        var users = await WithIncludes()
            .Where(u => u.OrganizationId == orgId)
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();

        return Ok(users.Select(ToResponse));
    }

    [HttpPost]
    public async Task<ActionResult<ManagedUserResponse>> Create(CreateUserRequest request)
    {
        if (!User.IsAdmin()) return Forbid();

        var orgId = User.GetOrganizationId();

        if (request.DepartmentId.HasValue)
        {
            var departmentOk = await db.Departments.AnyAsync(d => d.Id == request.DepartmentId && d.OrganizationId == orgId);
            if (!departmentOk) return BadRequest("Invalid department.");
        }

        var newUser = new User
        {
            UserCode = request.UserCode,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Username = request.Username,
            PrivilegeLevel = request.PrivilegeLevel,
            DepartmentId = request.DepartmentId,
            OrganizationId = orgId,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        newUser.PasswordHash = PasswordHasher.HashPassword(newUser, request.Password);

        db.Users.Add(newUser);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return BadRequest("Could not create the user. Check the username and user code aren't already in use.");
        }

        var full = await WithIncludes().FirstAsync(u => u.Id == newUser.Id);
        return Ok(ToResponse(full));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ManagedUserResponse>> Update(int id, UpdateUserRequest request)
    {
        if (!User.IsAdmin()) return Forbid();

        var orgId = User.GetOrganizationId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == orgId);
        if (user is null) return NotFound();

        if (request.DepartmentId.HasValue)
        {
            var departmentOk = await db.Departments.AnyAsync(d => d.Id == request.DepartmentId && d.OrganizationId == orgId);
            if (!departmentOk) return BadRequest("Invalid department.");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Username = request.Username;
        user.PrivilegeLevel = request.PrivilegeLevel;
        user.DepartmentId = request.DepartmentId;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return BadRequest("Could not save this user. Check the username isn't already in use.");
        }

        var full = await WithIncludes().FirstAsync(u => u.Id == user.Id);
        return Ok(ToResponse(full));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!User.IsAdmin()) return Forbid();

        if (id == User.GetUserId())
        {
            return BadRequest("You cannot delete your own account.");
        }

        var orgId = User.GetOrganizationId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == orgId);
        if (user is null) return NotFound();

        db.Users.Remove(user);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return BadRequest("Cannot delete: this user has created records still in the system.");
        }

        return NoContent();
    }

    private IQueryable<User> WithIncludes() => db.Users.Include(u => u.Department);

    private static ManagedUserResponse ToResponse(User u) => new(
        u.Id, u.UserCode, u.FirstName, u.LastName, u.Username,
        u.PrivilegeLevel, u.DepartmentId, u.Department?.Name,
        u.LastLoginAt, u.CreatedAt
    );
}
