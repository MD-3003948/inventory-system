using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/salesorders")]
[Authorize]
public class SalesOrdersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesOrderResponse>>> GetAll()
    {
        var orgId = User.GetOrganizationId();
        var orders = await WithIncludes()
            .Where(o => o.Customer!.OrganizationId == orgId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SalesOrderResponse>> GetById(int id)
    {
        var orgId = User.GetOrganizationId();
        var order = await WithIncludes().FirstOrDefaultAsync(o => o.Id == id && o.Customer!.OrganizationId == orgId);
        if (order is null) return NotFound();

        return Ok(ToResponse(order));
    }

    [HttpPost]
    public async Task<ActionResult<SalesOrderResponse>> Create(SalesOrderRequest request)
    {
        var orgId = User.GetOrganizationId();

        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == request.CustomerId && c.OrganizationId == orgId);
        if (customer is null) return BadRequest("Customer not found.");

        var order = new SalesOrder
        {
            CustomerId = request.CustomerId,
            Status = SalesOrderStatus.Pending,
            OrderDate = DateTimeOffset.UtcNow,
            OrderNumber = "PENDING",
        };

        foreach (var line in request.LineItems)
        {
            var product = await db.Products.FirstOrDefaultAsync(p => p.Id == line.ProductId && p.OrganizationId == orgId);
            if (product is null) return BadRequest($"Product {line.ProductId} not found.");

            order.LineItems.Add(new OrderLineItem
            {
                ProductId = product.Id,
                Quantity = line.Quantity,
                UnitPriceAtSale = product.UnitPrice,
            });
        }

        db.SalesOrders.Add(order);
        await db.SaveChangesAsync();

        order.OrderNumber = $"SO-{order.Id:D6}";
        await db.SaveChangesAsync();

        var full = await WithIncludes().FirstAsync(o => o.Id == order.Id);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, ToResponse(full));
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<SalesOrderResponse>> UpdateStatus(int id, SalesOrderStatusUpdateRequest request)
    {
        var orgId = User.GetOrganizationId();
        var order = await WithIncludes().FirstOrDefaultAsync(o => o.Id == id && o.Customer!.OrganizationId == orgId);
        if (order is null) return NotFound();

        order.Status = request.Status;
        await db.SaveChangesAsync();

        return Ok(ToResponse(order));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var orgId = User.GetOrganizationId();
        var order = await db.SalesOrders.Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == id && o.Customer!.OrganizationId == orgId);
        if (order is null) return NotFound();

        db.SalesOrders.Remove(order);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<SalesOrder> WithIncludes() =>
        db.SalesOrders
            .Include(o => o.Customer)
            .Include(o => o.LineItems)
            .ThenInclude(l => l.Product);

    private static SalesOrderResponse ToResponse(SalesOrder o) => new(
        o.Id,
        o.OrderNumber,
        o.CustomerId,
        o.Customer?.Name ?? string.Empty,
        o.Status,
        o.OrderDate,
        o.LineItems.Sum(l => l.Quantity * l.UnitPriceAtSale),
        o.LineItems.Select(l => new OrderLineItemResponse(
            l.Id,
            l.ProductId,
            l.Product?.Name ?? string.Empty,
            l.Product?.Sku ?? string.Empty,
            l.Quantity,
            l.UnitPriceAtSale,
            l.Quantity * l.UnitPriceAtSale
        )).ToList()
    );
}
