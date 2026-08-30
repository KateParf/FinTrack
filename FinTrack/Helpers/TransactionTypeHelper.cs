using FinTrack.Models;

namespace FinTrack.Helpers;

public static class TransactionTypeHelper
{
    public static void ValidateIncomeExpenseType(TransactionType type)
    {
        if (type is not (TransactionType.Income or TransactionType.Expense))
            throw new InvalidOperationException("Only income and expense transactions are allowed here");
    }
}
