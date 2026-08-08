namespace InventorySystem.Api.Models;

public class OrderLineItem
{
    public int Id { get; set; }
    public int SalesOrderId { get; set; }
    public SalesOrder? SalesOrder { get; set; }
    public int InventoryItemId { get; set; }
    public InventoryItem? InventoryItem { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceAtSale { get; set; }
}
