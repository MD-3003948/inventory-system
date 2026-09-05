using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Filters;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    private static readonly PasswordHasher<User> PasswordHasher = new();

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
        if (user is null)
        {
            return Unauthorized();
        }

        var verification = PasswordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Unauthorized();
        }

        user.LastLoginAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        var token = GenerateToken(user);
        return Ok(new LoginResponse(
            token, user.UserCode, user.FirstName, user.LastName, user.PrivilegeLevel, user.MustChangePassword));
    }

    [HttpGet("me")]
    [Authorize]
    [AllowPendingPasswordChange]
    public async Task<ActionResult<CurrentUserResponse>> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await db.Users
            .Include(u => u.Organization)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new CurrentUserResponse(
            user.UserCode, user.FirstName, user.LastName, user.Username,
            user.Organization?.Name ?? string.Empty, user.PrivilegeLevel, user.Department?.Name,
            user.LastLoginAt, user.CreatedAt, user.MustChangePassword));
    }

    [HttpPost("change-password")]
    [Authorize]
    [AllowPendingPasswordChange]
    public async Task<ActionResult<LoginResponse>> ChangePassword(ChangePasswordRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await db.Users.FindAsync(userId);
        if (user is null)
        {
            return Unauthorized();
        }

        var verification = PasswordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (verification == PasswordVerificationResult.Failed)
        {
            return BadRequest("Current password is incorrect.");
        }

        var policyError = PasswordPolicy.Validate(request.NewPassword);
        if (policyError is not null)
        {
            return BadRequest(policyError);
        }

        user.PasswordHash = PasswordHasher.HashPassword(user, request.NewPassword);
        user.MustChangePassword = false;
        await db.SaveChangesAsync();

        var token = GenerateToken(user);
        return Ok(new LoginResponse(
            token, user.UserCode, user.FirstName, user.LastName, user.PrivilegeLevel, user.MustChangePassword));
    }

    private string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("privilege_level", user.PrivilegeLevel.ToString()),
            new Claim("organization_id", user.OrganizationId.ToString()),
            new Claim("must_change_password", user.MustChangePassword.ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
