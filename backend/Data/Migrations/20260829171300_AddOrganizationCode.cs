using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventorySystem.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Organizations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // Rename the existing default org to XELP per the user's request, and give
            // it a real Code now that the column exists.
            migrationBuilder.Sql("UPDATE \"Organizations\" SET \"Code\" = 'XELP', \"Name\" = 'XELP' WHERE \"Name\" = 'Platform';");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Code",
                table: "Organizations",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Organizations_Code",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Organizations");
        }
    }
}
