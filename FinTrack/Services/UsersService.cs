using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Services;

public class UsersService
{
    private readonly ApplicationContext _context;

    public UsersService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<UserResponse?> GetUserByIdAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user == null ? null : ToResponse(user);
    }

    public async Task<UserResponse?> UpdateUserAsync(Guid userId, UserRequest request)
    {
        var existing = await _context.Users.FirstOrDefaultAsync(a => a.Id == userId);

        if (existing == null)
            return null;

        if (request.Name != null) existing.Name = InputNormalizer.NormalizeName(request.Name, "User name");
        if (request.BaseCurrency != null) existing.BaseCurrency = InputNormalizer.NormalizeCurrencyCode(request.BaseCurrency);

        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(userId);
    }

    private static UserResponse ToResponse(User user)
    {
        return new UserResponse(
            user.Id,
            user.Name,
            user.Email,
            user.BaseCurrency);
    }
}

