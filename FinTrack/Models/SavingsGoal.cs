namespace FinTrack.Models;

public class SavingsGoal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal TargetAmount { get; set; }
    public string CurrencyCode { get; set; } = null!;
    public DateOnly? TargetDate { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreationTimeAtUtc { get; set; }
    public ICollection<GoalContribution> Contributions { get; set; } = [];
}

public class GoalContribution
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public SavingsGoal Goal { get; set; } = null!;
    public GoalContributionType Type { get; set; }
    public decimal Amount { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    public string? Note { get; set; }
    public Guid? TransactionId { get; set; }
    public Transaction? Transaction { get; set; }
    public DateTime CreationTimeAtUtc { get; set; }
}

public enum GoalContributionType : short
{
    Deposit = 1,
    Withdrawal = 2
}