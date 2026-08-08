namespace InventorySystem.Api.Dtos;

public record TopItemMetric(
    int InventoryItemId,
    string Name,
    string Sku,
    int QuantitySold,
    int CurrentStock
);

public record TopCustomerMetric(
    int CustomerId,
    string Name,
    string Company,
    int OrderCount,
    decimal TotalSpend
);

public record DashboardMetricsResponse(
    int SalesOrdersInProgress,
    decimal RevenueInRange,
    DateTimeOffset FromDate,
    DateTimeOffset ToDate,
    List<TopItemMetric> TopItems,
    List<TopCustomerMetric> TopCustomers
);
