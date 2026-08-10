using System.ComponentModel.DataAnnotations;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Dtos;

public class OrderLineItemRequest
{
    [Required]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}

public record OrderLineItemResponse(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSku,
    int Quantity,
    decimal UnitPriceAtSale,
    decimal LineTotal
);

public class SalesOrderRequest
{
    [Required]
    public int CustomerId { get; set; }

    [Required, MinLength(1)]
    public List<OrderLineItemRequest> LineItems { get; set; } = [];
}

public class SalesOrderStatusUpdateRequest
{
    [Required]
    public SalesOrderStatus Status { get; set; }
}

public record SalesOrderResponse(
    int Id,
    string OrderNumber,
    int CustomerId,
    string CustomerName,
    SalesOrderStatus Status,
    DateTimeOffset OrderDate,
    decimal TotalAmount,
    List<OrderLineItemResponse> LineItems
);
