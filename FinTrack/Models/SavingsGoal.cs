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
    public DateTime UpdateTimeAtUtc { get; set; }
    public ICollection<Account> Accounts { get; set; } = [];
}
