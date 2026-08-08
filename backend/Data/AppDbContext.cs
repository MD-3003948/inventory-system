using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();

    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();

    public DbSet<OrderLineItem> OrderLineItems => Set<OrderLineItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.Property(i => i.Name).IsRequired().HasMaxLength(200);
            entity.Property(i => i.Sku).IsRequired().HasMaxLength(64);
            entity.Property(i => i.Category).HasMaxLength(100);
            entity.Property(i => i.UnitPrice).HasColumnType("numeric(10,2)");
            entity.HasIndex(i => i.Sku).IsUnique();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.UserCode).IsRequired().HasMaxLength(32);
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Organization).HasMaxLength(200);
            entity.HasIndex(u => u.UserCode).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.Property(c => c.Name).IsRequired().HasMaxLength(200);
            entity.Property(c => c.Email).HasMaxLength(200);
            entity.Property(c => c.Phone).HasMaxLength(32);
            entity.Property(c => c.Company).HasMaxLength(200);
        });

        modelBuilder.Entity<SalesOrder>(entity =>
        {
            entity.Property(o => o.OrderNumber).IsRequired().HasMaxLength(32);
            entity.Property(o => o.Status).HasConversion<string>().HasMaxLength(32);
            entity.HasIndex(o => o.OrderNumber).IsUnique();
            entity.HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId);
        });

        modelBuilder.Entity<OrderLineItem>(entity =>
        {
            entity.Property(l => l.UnitPriceAtSale).HasColumnType("numeric(10,2)");
            entity.HasOne(l => l.SalesOrder)
                .WithMany(o => o.LineItems)
                .HasForeignKey(l => l.SalesOrderId);
            entity.HasOne(l => l.InventoryItem)
                .WithMany()
                .HasForeignKey(l => l.InventoryItemId);
        });
    }
}
