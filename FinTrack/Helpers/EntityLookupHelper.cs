using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Helpers;

public static class EntityLookupHelper
{
    public static async Task<Account> GetActiveAccountAsync(this ApplicationContext context, Guid userId, Guid accountId)
    {
        var account = await context.Accounts
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == accountId);

        if (account == null)
            throw new InvalidOperationException("Account not found");

        if (account.IsArchived)
            throw new InvalidOperationException("Account is archived");

        return account;
    }

    public static async Task<Category?> GetActiveCategoryAsync(
        this ApplicationContext context,
        Guid userId,
        Guid? categoryId,
        TransactionType transactionType)
    {
        if (!categoryId.HasValue)
            return null;

        var category = await context.Categories
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == categoryId.Value);

        if (category == null)
            throw new InvalidOperationException("Category not found");

        if (category.IsArchived)
            throw new InvalidOperationException("Category is archived");

        var expectedType = transactionType == TransactionType.Income
            ? CategoryType.Income
            : CategoryType.Expense;

        if (category.Type != expectedType)
            throw new InvalidOperationException("Category type does not match transaction type");

        return category;
    }

    public static async Task<SavingsGoal?> GetActiveSavingGoalAsync(this ApplicationContext context, Guid userId, Guid goalId)
    {
        var goal = await context.SavingsGoals
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == goalId);

        if (goal?.IsArchived == true)
            throw new InvalidOperationException("Saving goal is archived");

        return goal;
    }

}
