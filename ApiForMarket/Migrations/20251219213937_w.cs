using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiForMarket.Migrations
{
    /// <inheritdoc />
    public partial class w : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IsModerated",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsModerated",
                table: "Products");
        }
    }
}
