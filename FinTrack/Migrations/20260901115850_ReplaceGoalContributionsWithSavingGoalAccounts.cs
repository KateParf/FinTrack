using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinTrack.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceGoalContributionsWithSavingGoalAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GoalContributions");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdateTimeAtUtc",
                table: "SavingsGoals",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "SavingsGoalId",
                table: "Accounts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_SavingsGoalId",
                table: "Accounts",
                column: "SavingsGoalId");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_SavingsGoals_SavingsGoalId",
                table: "Accounts",
                column: "SavingsGoalId",
                principalTable: "SavingsGoals",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_SavingsGoals_SavingsGoalId",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_SavingsGoalId",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "UpdateTimeAtUtc",
                table: "SavingsGoals");

            migrationBuilder.DropColumn(
                name: "SavingsGoalId",
                table: "Accounts");

            migrationBuilder.CreateTable(
                name: "GoalContributions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GoalId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreationTimeAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OccurredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoalContributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoalContributions_SavingsGoals_GoalId",
                        column: x => x.GoalId,
                        principalTable: "SavingsGoals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoalContributions_Transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GoalContributions_GoalId_OccurredAtUtc",
                table: "GoalContributions",
                columns: new[] { "GoalId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_GoalContributions_TransactionId",
                table: "GoalContributions",
                column: "TransactionId");
        }
    }
}
