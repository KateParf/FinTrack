namespace FinTrack.Models;

public class Category
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Name { get; set; } = null!;
    public CategoryType Type { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public bool IsArchived { get; set; }
    public ICollection<Category> Children { get; set; } = [];
    public ICollection<Transaction> Transactions { get; set; } = [];
}

public enum CategoryType : short
{
    Income = 1,
    Expense = 2
}