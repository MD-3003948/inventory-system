using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("metrics")]
    public async Task<ActionResult<DashboardMetricsResponse>> GetMetrics(
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate)
    {
        // Npgsql only accepts UTC (Offset=0) DateTimeOffset values for timestamptz columns.
        // A date-only query string like "2026-07-09" binds using the server's local offset,
        // so it must be normalized before it reaches the database.
        var to = (toDate ?? DateTimeOffset.UtcNow).ToUniversalTime();
        var from = (fromDate ?? to.AddDays(-30)).ToUniversalTime();

        var salesOrdersInProgress = await db.SalesOrders
            .CountAsync(o => o.Status == SalesOrderStatus.Pending || o.Status == SalesOrderStatus.Processing);

        // Only Completed orders count as recognized revenue - Pending/Processing/Shipped
        // haven't actually closed yet, and Cancelled never will.
        var revenueInRange = await db.OrderLineItems
            .Where(l => l.SalesOrder!.Status == SalesOrderStatus.Completed
                && l.SalesOrder.OrderDate >= from && l.SalesOrder.OrderDate <= to)
            .SumAsync(l => (decimal?)(l.Quantity * l.UnitPriceAtSale)) ?? 0m;

        var topItems = await db.OrderLineItems
            .GroupBy(l => l.InventoryItemId)
            .Select(g => new { InventoryItemId = g.Key, QuantitySold = g.Sum(l => l.Quantity) })
            .OrderByDescending(x => x.QuantitySold)
            .Take(3)
            .Join(db.InventoryItems, x => x.InventoryItemId, i => i.Id, (x, i) =>
                new TopItemMetric(i.Id, i.Name, i.Sku, x.QuantitySold, i.Quantity))
            .ToListAsync();

        var topCustomers = await db.OrderLineItems
            .Select(l => new
            {
                l.SalesOrder!.CustomerId,
                l.SalesOrder.Id,
                LineTotal = l.Quantity * l.UnitPriceAtSale,
            })
            .GroupBy(x => x.CustomerId)
            .Select(g => new
            {
                CustomerId = g.Key,
                OrderCount = g.Select(x => x.Id).Distinct().Count(),
                TotalSpend = g.Sum(x => x.LineTotal),
            })
            .OrderByDescending(x => x.TotalSpend)
            .Take(5)
            .Join(db.Customers, x => x.CustomerId, c => c.Id, (x, c) =>
                new TopCustomerMetric(c.Id, c.Name, c.Company, x.OrderCount, x.TotalSpend))
            .ToListAsync();

        var activeCustomerOrders = await db.SalesOrders
            .Where(o => o.Status == SalesOrderStatus.Pending || o.Status == SalesOrderStatus.Processing)
            .GroupBy(o => o.CustomerId)
            .Select(g => new { CustomerId = g.Key, ActiveOrderCount = g.Count() })
            .OrderByDescending(x => x.ActiveOrderCount)
            .Join(db.Customers, x => x.CustomerId, c => c.Id, (x, c) =>
                new ActiveCustomerOrderMetric(c.Id, c.Name, c.Company, x.ActiveOrderCount))
            .ToListAsync();

        return Ok(new DashboardMetricsResponse(
            salesOrdersInProgress, revenueInRange, from, to, topItems, topCustomers, activeCustomerOrders));
    }
}
