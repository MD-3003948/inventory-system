using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();

    public DbSet<Supplier> Suppliers => Set<Supplier>();

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
    }
}
