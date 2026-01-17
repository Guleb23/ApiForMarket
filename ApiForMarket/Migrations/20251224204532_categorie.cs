using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ApiForMarket.Migrations
{
    /// <inheritdoc />
    public partial class categorie : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoriesId",
                table: "Categories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                table: "Categories",
                type: "uuid",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CategoriesId", "Name", "ParentId" },
                values: new object[,]
                {
                    { new Guid("0a7a847c-f012-4051-9ff3-202164f875d0"), null, "pubg", new Guid("58f83966-63e2-4433-9753-fbf098405f2f") },
                    { new Guid("58f83966-63e2-4433-9753-fbf098405f2f"), null, "Игры", null },
                    { new Guid("8d8ed595-0a0c-4855-bc33-269e6ee4ca8f"), null, "Telegram", new Guid("e309cd57-73dc-4068-b236-8b4286447192") },
                    { new Guid("e309cd57-73dc-4068-b236-8b4286447192"), null, "СоцСети", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_CategoriesId",
                table: "Categories",
                column: "CategoriesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Categories_CategoriesId",
                table: "Categories",
                column: "CategoriesId",
                principalTable: "Categories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Categories_CategoriesId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_CategoriesId",
                table: "Categories");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("0a7a847c-f012-4051-9ff3-202164f875d0"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("58f83966-63e2-4433-9753-fbf098405f2f"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("8d8ed595-0a0c-4855-bc33-269e6ee4ca8f"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("e309cd57-73dc-4068-b236-8b4286447192"));

            migrationBuilder.DropColumn(
                name: "CategoriesId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "Categories");
        }
    }
}
