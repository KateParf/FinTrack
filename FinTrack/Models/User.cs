using Microsoft.AspNetCore.Identity;

namespace FinTrack.Models;

public class User : IdentityUser<Guid>
{
    public string Name { get; set; } = null!;
    public string BaseCurrency { get; set; } = "RUB";
    public DateTime CreationTimeAtUtc { get; set; }

    public ICollection<Account> Accounts { get; set; } = [];
    public ICollection<Category> Categories { get; set; } = [];
    public ICollection<SavingsGoal> SavingsGoals { get; set; } = [];
}