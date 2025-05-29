using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CalorieManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEntitiesForNewFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "UserDietLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "StreakRecords",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Unit",
                table: "UserDietLogs");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "StreakRecords");
        }
    }
}
