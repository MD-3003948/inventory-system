using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace InventorySystem.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductsAndOrganizations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ---- Phase 1: structural renames (preserve existing rows instead of drop+recreate) ----
            migrationBuilder.DropForeignKey(
                name: "FK_OrderLineItems_InventoryItems_InventoryItemId",
                table: "OrderLineItems");

            migrationBuilder.DropColumn(
                name: "Organization",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "InventoryItemId",
                table: "OrderLineItems",
                newName: "ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderLineItems_InventoryItemId",
                table: "OrderLineItems",
                newName: "IX_OrderLineItems_ProductId");

            // Rename instead of drop+recreate, so existing rows (e.g. the seeded "Widget A") survive.
            migrationBuilder.RenameTable(
                name: "InventoryItems",
                newName: "Products");

            migrationBuilder.Sql("ALTER TABLE \"Products\" RENAME CONSTRAINT \"PK_InventoryItems\" TO \"PK_Products\";");
            migrationBuilder.Sql("ALTER TABLE \"Products\" RENAME CONSTRAINT \"FK_InventoryItems_Suppliers_SupplierId\" TO \"FK_Products_Suppliers_SupplierId\";");
            migrationBuilder.RenameIndex(
                name: "IX_InventoryItems_Sku",
                table: "Products",
                newName: "IX_Products_Sku");
            migrationBuilder.RenameIndex(
                name: "IX_InventoryItems_SupplierId",
                table: "Products",
                newName: "IX_Products_SupplierId");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Products");

            // ---- Phase 2: add org-scoping columns as nullable first (backfilled in Phase 5) ----
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Suppliers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Customers",
                type: "integer",
                nullable: true);

            // ---- Phase 3: new lookup tables ----
            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AttributeTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OrganizationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttributeTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttributeTemplates_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CustomerCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OrganizationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerCategories_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PartCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OrganizationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartCategories_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PartSubCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PartCategoryId = table.Column<int>(type: "integer", nullable: false),
                    OrganizationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartSubCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartSubCategories_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PartSubCategories_PartCategories_PartCategoryId",
                        column: x => x.PartCategoryId,
                        principalTable: "PartCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // ---- Phase 4: seed the default org + default lookup rows with known Ids, for backfilling ----
            migrationBuilder.InsertData(
                table: "Organizations",
                columns: new[] { "Id", "Name", "CreatedAt" },
                values: new object[] { 1, "Platform", DateTimeOffset.UtcNow });

            migrationBuilder.InsertData(
                table: "PartCategories",
                columns: new[] { "Id", "Name", "OrganizationId" },
                values: new object[] { 1, "Uncategorized", 1 });

            migrationBuilder.InsertData(
                table: "PartSubCategories",
                columns: new[] { "Id", "Name", "PartCategoryId", "OrganizationId" },
                values: new object[] { 1, "Uncategorized", 1, 1 });

            migrationBuilder.InsertData(
                table: "CustomerCategories",
                columns: new[] { "Id", "Name", "OrganizationId" },
                values: new object[] { 1, "Uncategorized", 1 });

            // ---- Phase 5: backfill existing rows onto the default org, then fix up identity sequences ----
            migrationBuilder.Sql("UPDATE \"Users\" SET \"OrganizationId\" = 1 WHERE \"OrganizationId\" IS NULL;");
            migrationBuilder.Sql("UPDATE \"Suppliers\" SET \"OrganizationId\" = 1 WHERE \"OrganizationId\" IS NULL;");
            migrationBuilder.Sql("UPDATE \"Customers\" SET \"OrganizationId\" = 1 WHERE \"OrganizationId\" IS NULL;");

            migrationBuilder.Sql("SELECT setval(pg_get_serial_sequence('\"Organizations\"', 'Id'), (SELECT MAX(\"Id\") FROM \"Organizations\"));");
            migrationBuilder.Sql("SELECT setval(pg_get_serial_sequence('\"PartCategories\"', 'Id'), (SELECT MAX(\"Id\") FROM \"PartCategories\"));");
            migrationBuilder.Sql("SELECT setval(pg_get_serial_sequence('\"PartSubCategories\"', 'Id'), (SELECT MAX(\"Id\") FROM \"PartSubCategories\"));");
            migrationBuilder.Sql("SELECT setval(pg_get_serial_sequence('\"CustomerCategories\"', 'Id'), (SELECT MAX(\"Id\") FROM \"CustomerCategories\"));");

            // ---- Phase 6: now safe to make the org columns required ----
            migrationBuilder.AlterColumn<int>(
                name: "OrganizationId",
                table: "Users",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OrganizationId",
                table: "Suppliers",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OrganizationId",
                table: "Customers",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            // ---- Phase 7: add the new Product columns, nullable first where a backfill is needed ----
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Products",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PartCategoryId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PartSubCategoryId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AttributeTemplateId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CustomerCategoryId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedCustomerId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagePath",
                table: "Products",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Products",
                type: "integer",
                nullable: true);

            // ---- Phase 8: backfill existing product rows onto the defaults seeded above ----
            migrationBuilder.Sql("UPDATE \"Products\" SET \"PartCategoryId\" = 1 WHERE \"PartCategoryId\" IS NULL;");
            migrationBuilder.Sql("UPDATE \"Products\" SET \"PartSubCategoryId\" = 1 WHERE \"PartSubCategoryId\" IS NULL;");
            migrationBuilder.Sql("UPDATE \"Products\" SET \"CustomerCategoryId\" = 1 WHERE \"CustomerCategoryId\" IS NULL;");
            migrationBuilder.Sql("UPDATE \"Products\" SET \"OrganizationId\" = 1 WHERE \"OrganizationId\" IS NULL;");
            migrationBuilder.Sql("UPDATE \"Products\" SET \"CreatedByUserId\" = (SELECT MIN(\"Id\") FROM \"Users\") WHERE \"CreatedByUserId\" IS NULL;");

            // ---- Phase 9: now safe to make the required Product columns NOT NULL ----
            migrationBuilder.AlterColumn<int>(
                name: "PartCategoryId",
                table: "Products",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PartSubCategoryId",
                table: "Products",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CustomerCategoryId",
                table: "Products",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OrganizationId",
                table: "Products",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CreatedByUserId",
                table: "Products",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            // ---- Phase 10: indexes and remaining foreign keys ----
            migrationBuilder.CreateIndex(name: "IX_Users_OrganizationId", table: "Users", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_Suppliers_OrganizationId", table: "Suppliers", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_Customers_OrganizationId", table: "Customers", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_AttributeTemplates_OrganizationId", table: "AttributeTemplates", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_CustomerCategories_OrganizationId", table: "CustomerCategories", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_PartCategories_OrganizationId", table: "PartCategories", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_PartSubCategories_OrganizationId", table: "PartSubCategories", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_PartSubCategories_PartCategoryId", table: "PartSubCategories", column: "PartCategoryId");
            migrationBuilder.CreateIndex(name: "IX_Products_AssignedCustomerId", table: "Products", column: "AssignedCustomerId");
            migrationBuilder.CreateIndex(name: "IX_Products_AttributeTemplateId", table: "Products", column: "AttributeTemplateId");
            migrationBuilder.CreateIndex(name: "IX_Products_CreatedByUserId", table: "Products", column: "CreatedByUserId");
            migrationBuilder.CreateIndex(name: "IX_Products_CustomerCategoryId", table: "Products", column: "CustomerCategoryId");
            migrationBuilder.CreateIndex(name: "IX_Products_OrganizationId", table: "Products", column: "OrganizationId");
            migrationBuilder.CreateIndex(name: "IX_Products_PartCategoryId", table: "Products", column: "PartCategoryId");
            migrationBuilder.CreateIndex(name: "IX_Products_PartSubCategoryId", table: "Products", column: "PartSubCategoryId");

            migrationBuilder.AddForeignKey(name: "FK_Customers_Organizations_OrganizationId", table: "Customers", column: "OrganizationId", principalTable: "Organizations", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_OrderLineItems_Products_ProductId", table: "OrderLineItems", column: "ProductId", principalTable: "Products", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(name: "FK_Suppliers_Organizations_OrganizationId", table: "Suppliers", column: "OrganizationId", principalTable: "Organizations", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Users_Organizations_OrganizationId", table: "Users", column: "OrganizationId", principalTable: "Organizations", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Products_AttributeTemplates_AttributeTemplateId", table: "Products", column: "AttributeTemplateId", principalTable: "AttributeTemplates", principalColumn: "Id", onDelete: ReferentialAction.SetNull);
            migrationBuilder.AddForeignKey(name: "FK_Products_CustomerCategories_CustomerCategoryId", table: "Products", column: "CustomerCategoryId", principalTable: "CustomerCategories", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Products_Customers_AssignedCustomerId", table: "Products", column: "AssignedCustomerId", principalTable: "Customers", principalColumn: "Id", onDelete: ReferentialAction.SetNull);
            migrationBuilder.AddForeignKey(name: "FK_Products_Organizations_OrganizationId", table: "Products", column: "OrganizationId", principalTable: "Organizations", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Products_PartCategories_PartCategoryId", table: "Products", column: "PartCategoryId", principalTable: "PartCategories", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Products_PartSubCategories_PartSubCategoryId", table: "Products", column: "PartSubCategoryId", principalTable: "PartSubCategories", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Products_Users_CreatedByUserId", table: "Products", column: "CreatedByUserId", principalTable: "Users", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Note: unlike Up(), this is a best-effort reversal (standard for data-backfilling
            // migrations) - rolling back will lose Product/Organization data, not just structure.
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Organizations_OrganizationId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderLineItems_Products_ProductId",
                table: "OrderLineItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Suppliers_Organizations_OrganizationId",
                table: "Suppliers");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Organizations_OrganizationId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "AttributeTemplates");

            migrationBuilder.DropTable(
                name: "CustomerCategories");

            migrationBuilder.DropTable(
                name: "PartSubCategories");

            migrationBuilder.DropTable(
                name: "PartCategories");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Users_OrganizationId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_OrganizationId",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_OrganizationId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Customers");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "OrderLineItems",
                newName: "InventoryItemId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderLineItems_ProductId",
                table: "OrderLineItems",
                newName: "IX_OrderLineItems_InventoryItemId");

            migrationBuilder.AddColumn<string>(
                name: "Organization",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "InventoryItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SupplierId = table.Column<int>(type: "integer", nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    Sku = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryItems_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_Sku",
                table: "InventoryItems",
                column: "Sku",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_SupplierId",
                table: "InventoryItems",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderLineItems_InventoryItems_InventoryItemId",
                table: "OrderLineItems",
                column: "InventoryItemId",
                principalTable: "InventoryItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
