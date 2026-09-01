using FinTrack.Models;

namespace FinTrack.Helpers;

public static class AmountHelper
{
    public static void ValidatePositiveAmount(decimal amount, string fieldName = "Amount")
    {
        if (amount <= 0)
            throw new InvalidOperationException($"{fieldName} must be greater than zero");
    }

    public static decimal GetSignedTransactionAmount(TransactionType type, decimal amount)
    {
        ValidatePositiveAmount(amount);

        return type switch
        {
            TransactionType.Income => amount,
            TransactionType.TransferIn => amount,
            TransactionType.Expense => -amount,
            TransactionType.TransferOut => -amount,
            _ => 0
        };
    }

    public static decimal GetAccountBalance(Account account)
    {
        return account.OpeningBalance + account.Transactions.Sum(t => GetSignedTransactionAmount(t.Type, t.Amount));
    }

    public static decimal GetSavingGoalCurrentAmount(SavingsGoal goal)
    {
        return goal.Accounts.Sum(GetAccountBalance);
    }
}
