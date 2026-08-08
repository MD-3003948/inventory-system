using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();

    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public DbSet<User> Users => Set<User>();

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
    }
}
