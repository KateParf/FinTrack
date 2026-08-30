namespace FinTrack.Models;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    // Для Income / Expense = null
    // Для TransferOut / TransferIn одинаковый Guid
    public Guid? TransferGroupId { get; set; }
    public string? Note { get; set; }
    public DateTime CreationTimeAtUtc { get; set; }
    public DateTime UpdateTimeAtUtc { get; set; }
}

public enum TransactionType : short
{
    Income = 1,
    Expense = 2,

    TransferOut = 3,
    TransferIn = 4
}