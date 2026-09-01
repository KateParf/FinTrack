namespace FinTrack.Models;

public class Account
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Name { get; set; } = null!;
    public AccountType Type { get; set; }
    public string CurrencyCode { get; set; } = null!;
    public decimal OpeningBalance { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreationTimeAtUtc { get; set; }
    public DateTime UpdateTimeAtUtc { get; set; }
    public Guid? SavingsGoalId { get; set; }
    public SavingsGoal? SavingsGoal { get; set; }

    public ICollection<Transaction> Transactions { get; set; } = [];
}

public enum AccountType : short
{
    Cash = 1,
    DebitCard = 2,
    Savings = 3,
    Deposit = 4,
    Other = 5
}