using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FinTrack.Models;

public class ApplicationContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options) { }

    public DbSet<Account> Accounts { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<SavingsGoal> SavingsGoals { get; set; }
    public DbSet<GoalContribution> GoalContributions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.BaseCurrency).IsRequired().HasMaxLength(3);
        });

        // Account
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Type).HasConversion<short>();
            entity.Property(x => x.CurrencyCode).IsRequired().HasMaxLength(3);
            entity.Property(x => x.OpeningBalance).HasPrecision(18, 2);

            entity.HasOne(x => x.User).WithMany(x => x.Accounts)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new
            {
                x.UserId,
                x.IsArchived
            });
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Type).HasConversion<short>();

            entity.HasOne(x => x.User).WithMany(x => x.Categories)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Иерархия категорий:
            // Еда
            // ├── Кафе
            // └── Продукты
            entity.HasOne(x => x.ParentCategory).WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new
            {
                x.UserId,
                x.Type,
                x.IsArchived
            });
        });


        // Transaction
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Type).HasConversion<short>();
            entity.Property(x => x.Amount).HasPrecision(18, 2);
            entity.Property(x => x.Note).HasMaxLength(2000);
            entity.HasOne(x => x.Account).WithMany(x => x.Transactions)
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Category).WithMany(x => x.Transactions)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Основной индекс для истории операций счёта:
            //  WHERE AccountId = ...
            //  ORDER BY OccurredAtUtc
            entity.HasIndex(x => new
            {
                x.AccountId,
                x.OccurredAtUtc
            });

            // Для статистики расходов по категориям
            entity.HasIndex(x => new
            {
                x.CategoryId,
                x.OccurredAtUtc
            });

            // Для поиска второй половины перевода
            entity.HasIndex(x => x.TransferGroupId);
        });


        // SavingsGoal
        modelBuilder.Entity<SavingsGoal>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.TargetAmount).HasPrecision(18, 2);
            entity.Property(x => x.CurrencyCode).IsRequired().HasMaxLength(3);

            entity.HasOne(x => x.User).WithMany(x => x.SavingsGoals)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new
            {
                x.UserId,
                x.IsArchived
            });
        });


        // GoalContribution
        modelBuilder.Entity<GoalContribution>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Type).HasConversion<short>();
            entity.Property(x => x.Amount).HasPrecision(18, 2);
            entity.Property(x => x.Note).HasMaxLength(2000);

            entity.HasOne(x => x.Goal)
                .WithMany(x => x.Contributions)
                .HasForeignKey(x => x.GoalId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Transaction)
                .WithMany()
                .HasForeignKey(x => x.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new
            {
                x.GoalId,
                x.OccurredAtUtc
            });
        });
    }

}
