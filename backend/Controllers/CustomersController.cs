using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerResponse>>> GetAll()
    {
        var orgId = User.GetOrganizationId();
        var customers = await db.Customers
            .Where(c => c.OrganizationId == orgId)
            .OrderBy(c => c.Name)
            .Select(c => ToResponse(c))
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerResponse>> GetById(int id)
    {
        var orgId = User.GetOrganizationId();
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == orgId);
        if (customer is null) return NotFound();

        return Ok(ToResponse(customer));
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponse>> Create(CustomerRequest request)
    {
        var customer = new Customer
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Company = request.Company,
            CreatedAt = DateTimeOffset.UtcNow,
            OrganizationId = User.GetOrganizationId(),
        };

        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, ToResponse(customer));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CustomerResponse>> Update(int id, CustomerRequest request)
    {
        var orgId = User.GetOrganizationId();
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == orgId);
        if (customer is null) return NotFound();

        customer.Name = request.Name;
        customer.Email = request.Email;
        customer.Phone = request.Phone;
        customer.Company = request.Company;

        await db.SaveChangesAsync();

        return Ok(ToResponse(customer));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var orgId = User.GetOrganizationId();
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == orgId);
        if (customer is null) return NotFound();

        db.Customers.Remove(customer);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static CustomerResponse ToResponse(Customer c) =>
        new(c.Id, c.Name, c.Email, c.Phone, c.Company, c.CreatedAt);
}
