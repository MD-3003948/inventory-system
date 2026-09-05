using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventorySystem.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RegenerateAdminUserCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bring the originally-seeded admin user's code in line with the new
            // {PREFIX}-{XXXXXX} convention now used for all generated user codes.
            migrationBuilder.Sql("UPDATE \"Users\" SET \"UserCode\" = 'ADMIN-020037' WHERE \"UserCode\" = 'ADMIN-001';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"Users\" SET \"UserCode\" = 'ADMIN-001' WHERE \"UserCode\" = 'ADMIN-020037';");
        }
    }
}
