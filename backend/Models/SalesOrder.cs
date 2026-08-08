namespace InventorySystem.Api.Models;

public enum SalesOrderStatus
{
    Pending,
    Processing,
    Shipped,
    Completed,
    Cancelled,
}

public class SalesOrder
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public SalesOrderStatus Status { get; set; }
    public DateTimeOffset OrderDate { get; set; }

    public List<OrderLineItem> LineItems { get; set; } = [];
}
