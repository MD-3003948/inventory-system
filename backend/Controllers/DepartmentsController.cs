using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize]
public class DepartmentsController(AppDbContext db) : ControllerBase
{
    // Viewing the department list is open to any org member (needed for filters/dropdowns
    // elsewhere, e.g. the Products page) - only managing departments is admin-only.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DepartmentResponse>>> GetAll()
    {
        var orgId = User.GetOrganizationId();
        var departments = await db.Departments
            .Where(d => d.OrganizationId == orgId)
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentResponse(d.Id, d.Name, d.Users.Count))
            .ToListAsync();

        return Ok(departments);
    }

    [HttpPost]
    public async Task<ActionResult<DepartmentResponse>> Create(DepartmentUpsertRequest request)
    {
        if (!User.IsAdmin()) return Forbid();

        var orgId = User.GetOrganizationId();
        var department = new Department { Name = request.Name, OrganizationId = orgId };
        db.Departments.Add(department);
        await db.SaveChangesAsync();

        return Ok(new DepartmentResponse(department.Id, department.Name, 0));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DepartmentResponse>> Update(int id, DepartmentUpsertRequest request)
    {
        if (!User.IsAdmin()) return Forbid();

        var orgId = User.GetOrganizationId();
        var department = await db.Departments
            .Include(d => d.Users)
            .FirstOrDefaultAsync(d => d.Id == id && d.OrganizationId == orgId);
        if (department is null) return NotFound();

        department.Name = request.Name;
        await db.SaveChangesAsync();

        return Ok(new DepartmentResponse(department.Id, department.Name, department.Users.Count));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!User.IsAdmin()) return Forbid();

        var orgId = User.GetOrganizationId();
        var department = await db.Departments.FirstOrDefaultAsync(d => d.Id == id && d.OrganizationId == orgId);
        if (department is null) return NotFound();

        db.Departments.Remove(department);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
