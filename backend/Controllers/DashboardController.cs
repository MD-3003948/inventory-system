using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("metrics")]
    public async Task<ActionResult<DashboardMetricsResponse>> GetMetrics()
    {
        var orgId = User.GetOrganizationId();

        var salesOrdersInProgress = await db.SalesOrders
            .CountAsync(o => o.Customer!.OrganizationId == orgId
                && (o.Status == SalesOrderStatus.Pending || o.Status == SalesOrderStatus.Processing));

        var topItems = await db.OrderLineItems
            .Where(l => l.SalesOrder!.Customer!.OrganizationId == orgId)
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, QuantitySold = g.Sum(l => l.Quantity) })
            .OrderByDescending(x => x.QuantitySold)
            .Take(3)
            .Join(db.Products, x => x.ProductId, p => p.Id, (x, p) =>
                new TopItemMetric(p.Id, p.Name, p.Sku, x.QuantitySold, p.Quantity))
            .ToListAsync();

        var topCustomers = await db.OrderLineItems
            .Where(l => l.SalesOrder!.Customer!.OrganizationId == orgId)
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
            .Where(o => o.Customer!.OrganizationId == orgId
                && (o.Status == SalesOrderStatus.Pending || o.Status == SalesOrderStatus.Processing))
            .GroupBy(o => o.CustomerId)
            .Select(g => new { CustomerId = g.Key, ActiveOrderCount = g.Count() })
            .OrderByDescending(x => x.ActiveOrderCount)
            .Join(db.Customers, x => x.CustomerId, c => c.Id, (x, c) =>
                new ActiveCustomerOrderMetric(c.Id, c.Name, c.Company, x.ActiveOrderCount))
            .ToListAsync();

        return Ok(new DashboardMetricsResponse(
            salesOrdersInProgress, topItems, topCustomers, activeCustomerOrders));
    }

    [HttpGet("revenue-series")]
    public async Task<ActionResult<RevenueSeriesResponse>> GetRevenueSeries(
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        [FromQuery] int? customerId)
    {
        var orgId = User.GetOrganizationId();

        // Npgsql only accepts UTC (Offset=0) DateTimeOffset values for timestamptz columns.
        // A date-only query string like "2026-07-09" binds using the server's local offset,
        // so it must be normalized before it reaches the database.
        var to = (toDate ?? DateTimeOffset.UtcNow).ToUniversalTime();
        var from = (fromDate ?? to.AddDays(-30)).ToUniversalTime();

        // Pick a bucket size that keeps the chart to a sane number of bars regardless
        // of how wide a range was requested.
        var spanDays = (to - from).TotalDays;
        var granularity = spanDays <= 45 ? "day" : spanDays <= 220 ? "week" : "month";

        var query = db.OrderLineItems
            .Where(l => l.SalesOrder!.Customer!.OrganizationId == orgId
                && l.SalesOrder.Status == SalesOrderStatus.Completed
                && l.SalesOrder.OrderDate >= from && l.SalesOrder.OrderDate <= to);

        if (customerId.HasValue)
        {
            query = query.Where(l => l.SalesOrder!.CustomerId == customerId.Value);
        }

        // The installed Npgsql EF Core provider (9.0.4) has no EF.Functions.DateTrunc,
        // so bucket in memory instead of pushing a date_trunc() down to SQL.
        var rows = await query
            .Select(l => new { l.SalesOrder!.OrderDate, LineTotal = l.Quantity * l.UnitPriceAtSale })
            .ToListAsync();

        DateTimeOffset BucketStart(DateTimeOffset d) => granularity switch
        {
            "day" => new DateTimeOffset(d.Date, TimeSpan.Zero),
            "week" => new DateTimeOffset(d.Date.AddDays(-(int)d.DayOfWeek), TimeSpan.Zero),
            _ => new DateTimeOffset(new DateTime(d.Year, d.Month, 1), TimeSpan.Zero),
        };

        var points = rows
            .GroupBy(r => BucketStart(r.OrderDate))
            .Select(g => new RevenuePoint(g.Key, g.Sum(r => r.LineTotal)))
            .OrderBy(p => p.PeriodStart)
            .ToList();

        var totalRevenue = points.Sum(p => p.Revenue);

        return Ok(new RevenueSeriesResponse(granularity, totalRevenue, from, to, points));
    }
}
