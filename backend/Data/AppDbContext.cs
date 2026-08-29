using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Models;

namespace InventorySystem.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();

    public DbSet<OrderLineItem> OrderLineItems => Set<OrderLineItem>();

    public DbSet<Organization> Organizations => Set<Organization>();

    public DbSet<PartCategory> PartCategories => Set<PartCategory>();

    public DbSet<PartSubCategory> PartSubCategories => Set<PartSubCategory>();

    public DbSet<CustomerCategory> CustomerCategories => Set<CustomerCategory>();

    public DbSet<AttributeTemplate> AttributeTemplates => Set<AttributeTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Sku).IsRequired().HasMaxLength(64);
            entity.Property(p => p.Description).HasMaxLength(2000);
            entity.Property(p => p.UnitPrice).HasColumnType("numeric(10,2)");
            entity.Property(p => p.ImagePath).HasMaxLength(500);
            entity.HasIndex(p => p.Sku).IsUnique();

            entity.HasOne(p => p.PartCategory)
                .WithMany()
                .HasForeignKey(p => p.PartCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.PartSubCategory)
                .WithMany()
                .HasForeignKey(p => p.PartSubCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.AttributeTemplate)
                .WithMany()
                .HasForeignKey(p => p.AttributeTemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(p => p.CustomerCategory)
                .WithMany()
                .HasForeignKey(p => p.CustomerCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.AssignedCustomer)
                .WithMany()
                .HasForeignKey(p => p.AssignedCustomerId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(p => p.CreatedByUser)
                .WithMany()
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Organization)
                .WithMany()
                .HasForeignKey(p => p.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.UserCode).IsRequired().HasMaxLength(32);
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.HasIndex(u => u.UserCode).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();

            entity.HasOne(u => u.Organization)
                .WithMany()
                .HasForeignKey(u => u.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.Property(c => c.Name).IsRequired().HasMaxLength(200);
            entity.Property(c => c.Email).HasMaxLength(200);
            entity.Property(c => c.Phone).HasMaxLength(32);
            entity.Property(c => c.Company).HasMaxLength(200);

            entity.HasOne(c => c.Organization)
                .WithMany()
                .HasForeignKey(c => c.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasOne(s => s.Organization)
                .WithMany()
                .HasForeignKey(s => s.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
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
            entity.HasOne(l => l.Product)
                .WithMany()
                .HasForeignKey(l => l.ProductId);
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.Property(o => o.Name).IsRequired().HasMaxLength(200);
            entity.Property(o => o.Code).IsRequired().HasMaxLength(50);
            entity.HasIndex(o => o.Code).IsUnique();
        });

        modelBuilder.Entity<PartCategory>(entity =>
        {
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(c => c.Organization)
                .WithMany()
                .HasForeignKey(c => c.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PartSubCategory>(entity =>
        {
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(c => c.PartCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.PartCategoryId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(c => c.Organization)
                .WithMany()
                .HasForeignKey(c => c.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CustomerCategory>(entity =>
        {
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(c => c.Organization)
                .WithMany()
                .HasForeignKey(c => c.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AttributeTemplate>(entity =>
        {
            entity.Property(t => t.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(t => t.Organization)
                .WithMany()
                .HasForeignKey(t => t.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
