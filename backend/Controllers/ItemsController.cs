using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/items")]
public class ItemsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItemResponse>>> GetAll()
    {
        var items = await db.InventoryItems
            .OrderBy(i => i.Name)
            .Select(i => ToResponse(i))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InventoryItemResponse>> GetById(int id)
    {
        var item = await db.InventoryItems.FindAsync(id);
        if (item is null) return NotFound();

        return Ok(ToResponse(item));
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItemResponse>> Create(InventoryItemRequest request)
    {
        var now = DateTimeOffset.UtcNow;
        var item = new InventoryItem
        {
            Name = request.Name,
            Sku = request.Sku,
            Category = request.Category,
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.InventoryItems.Add(item);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ToResponse(item));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<InventoryItemResponse>> Update(int id, InventoryItemRequest request)
    {
        var item = await db.InventoryItems.FindAsync(id);
        if (item is null) return NotFound();

        item.Name = request.Name;
        item.Sku = request.Sku;
        item.Category = request.Category;
        item.Quantity = request.Quantity;
        item.UnitPrice = request.UnitPrice;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        return Ok(ToResponse(item));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.InventoryItems.FindAsync(id);
        if (item is null) return NotFound();

        db.InventoryItems.Remove(item);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static InventoryItemResponse ToResponse(InventoryItem i) =>
        new(i.Id, i.Name, i.Sku, i.Category, i.Quantity, i.UnitPrice, i.CreatedAt, i.UpdatedAt);
}
