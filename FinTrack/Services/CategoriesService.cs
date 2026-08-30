using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Services;

public class CategoriesService
{
    private readonly ApplicationContext _context;

    public CategoriesService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryResponse>> GetCategoriesAsync(Guid userId, CategoryType? type, bool includeArchived)
    {
        var query = _context.Categories.Where(c => c.UserId == userId);

        if (type.HasValue)
            query = query.Where(c => c.Type == type.Value);

        if (!includeArchived)
            query = query.Where(c => !c.IsArchived);

        var categories = await query.OrderBy(c => c.Name).ToListAsync();
        categories = BuildTree(categories);
        return categories.Select(ToResponse).ToList();
    }

    public async Task<CategoryResponse?> GetCategoryByIdAsync(Guid userId, Guid id)
    {
        var categories = await _context.Categories.Where(c => c.UserId == userId)
            .OrderBy(c => c.Name).ToListAsync();
        var category = BuildTree(categories).SelectMany(Flatten).FirstOrDefault(c => c.Id == id);
        return category == null ? null : ToResponse(category);
    }

    public async Task<CategoryResponse> AddCategoryAsync(Guid userId, CreateCategoryRequest request)
    {
        var now = DateTime.UtcNow;
        var category = new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = InputNormalizer.NormalizeName(request.Name, "Category name"),
            Type = request.Type,
            User = null!,
            ParentCategoryId = request.ParentCategoryId,
            ParentCategory = null,
            Children = [],
            Transactions = []
        };
        
        await ValidateParentAsync(userId, category.Id, category.ParentCategoryId, category.Type);

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return ToResponse(category);
    }

    public async Task<CategoryResponse?> UpdateCategoryAsync(Guid userId, Guid id, UpdateCategoryRequest category)
    {
        var existing = await _context.Categories
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == id);
        if (existing == null)
            return null;

        await ValidateParentAsync(userId, id, category.ParentCategoryId, existing.Type);

        existing.Name = InputNormalizer.NormalizeName(category.Name, "Category name");
        existing.ParentCategoryId = category.ParentCategoryId;

        await _context.SaveChangesAsync();
        return await GetCategoryByIdAsync(userId, id);
    }

    public async Task<bool> ArchiveCategoryByIdAsync(Guid userId, Guid id)
    {
        var categories = await _context.Categories
            .Where(c => c.UserId == userId).ToListAsync();

        var category = categories.FirstOrDefault(c => c.Id == id);
        if (category == null)
            return false;

        var idsToArchive = GetSubtreeIds(categories, id);
        foreach (var item in categories.Where(c => idsToArchive.Contains(c.Id)))
        {
            item.IsArchived = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreCategoryByIdAsync(Guid userId, Guid id)
    {
        var categories = await _context.Categories
            .Where(c => c.UserId == userId).ToListAsync();

        var category = categories.FirstOrDefault(c => c.Id == id);
        if (category == null)
            return false;

        if (category.ParentCategoryId.HasValue)
        {
            var parent = categories.FirstOrDefault(c => c.Id == category.ParentCategoryId.Value);
            if (parent?.IsArchived == true)
                throw new InvalidOperationException("Cannot restore category while its parent category is archived");
        }

        var idsToRestore = GetSubtreeIds(categories, id);
        foreach (var item in categories.Where(c => idsToRestore.Contains(c.Id)))
        {
            item.IsArchived = false;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    private async Task ValidateParentAsync(Guid userId, Guid categoryId, Guid? parentCategoryId, CategoryType type)
    {
        if (!parentCategoryId.HasValue)
            return;

        if (parentCategoryId.Value == categoryId)
            throw new InvalidOperationException("Category cannot be parent of itself");

        var parent = await _context.Categories
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == parentCategoryId.Value);

        if (parent == null)
            throw new InvalidOperationException("Parent category not found");

        if (parent.Type != type)
            throw new InvalidOperationException("Parent category must have the same type");

        if (parent.IsArchived)
            throw new InvalidOperationException("Parent category is archived");

        var categories = await _context.Categories.Where(c => c.UserId == userId)
            .Select(c => new Category
            {
                Id = c.Id,
                ParentCategoryId = c.ParentCategoryId
            }).ToListAsync();

        if (GetSubtreeIds(categories, categoryId).Contains(parentCategoryId.Value))
            throw new InvalidOperationException("Category cannot be moved under its own child category");
    }

    private static List<Category> BuildTree(List<Category> categories)
    {
        var byId = categories.ToDictionary(c => c.Id);
        var roots = new List<Category>();

        foreach (var category in categories)
        {
            category.ParentCategory = null;
            category.Children = [];
            category.Transactions = [];
        }

        foreach (var category in categories)
        {
            if (category.ParentCategoryId.HasValue && byId.TryGetValue(category.ParentCategoryId.Value, out var parent))
                parent.Children.Add(category);
            else
                roots.Add(category);
        }
        return roots;
    }

    private static IEnumerable<Category> Flatten(Category category)
    {
        yield return category;
        foreach (var child in category.Children.SelectMany(Flatten))
        {
            yield return child;
        }
    }

    private static HashSet<Guid> GetSubtreeIds(List<Category> categories, Guid rootId)
    {
        var childrenByParentId = categories.Where(c => c.ParentCategoryId.HasValue)
            .GroupBy(c => c.ParentCategoryId!.Value)
            .ToDictionary(g => g.Key, g => g.Select(c => c.Id).ToList());

        var result = new HashSet<Guid>();
        var stack = new Stack<Guid>();
        stack.Push(rootId);

        while (stack.Count > 0)
        {
            var currentId = stack.Pop();
            if (!result.Add(currentId))
                continue;

            if (!childrenByParentId.TryGetValue(currentId, out var childIds))
                continue;

            foreach (var childId in childIds)
                stack.Push(childId);
        }
        return result;
    }

    private static CategoryResponse ToResponse(Category category)
    {
        return new CategoryResponse(
            category.Id,
            category.Name,
            category.Type,
            category.ParentCategoryId,
            category.IsArchived,
            category.Children.Select(ToResponse).ToList());
    }
}
