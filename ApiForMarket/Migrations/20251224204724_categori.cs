using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ApiForMarket.Migrations
{
    /// <inheritdoc />
    public partial class categori : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("0a7a847c-f012-4051-9ff3-202164f875d0"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("8d8ed595-0a0c-4855-bc33-269e6ee4ca8f"));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CategoriesId", "Name", "ParentId" },
                values: new object[,]
                {
                    { new Guid("630542e8-9ed6-4792-a982-503206c42102"), null, "pubg", new Guid("58f83966-63e2-4433-9753-fbf098405f2f") },
                    { new Guid("deeae385-f131-4a61-bcdc-a51084b19e6b"), null, "Telegram", new Guid("e309cd57-73dc-4068-b236-8b4286447192") }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("630542e8-9ed6-4792-a982-503206c42102"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("deeae385-f131-4a61-bcdc-a51084b19e6b"));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CategoriesId", "Name", "ParentId" },
                values: new object[,]
                {
                    { new Guid("0a7a847c-f012-4051-9ff3-202164f875d0"), null, "pubg", new Guid("58f83966-63e2-4433-9753-fbf098405f2f") },
                    { new Guid("8d8ed595-0a0c-4855-bc33-269e6ee4ca8f"), null, "Telegram", new Guid("e309cd57-73dc-4068-b236-8b4286447192") }
                });
        }
    }
}
