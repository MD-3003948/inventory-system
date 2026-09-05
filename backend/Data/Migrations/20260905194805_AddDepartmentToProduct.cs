using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventorySystem.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_DepartmentId",
                table: "Products",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Departments_DepartmentId",
                table: "Products",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Departments_DepartmentId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_DepartmentId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "Products");
        }
    }
}
