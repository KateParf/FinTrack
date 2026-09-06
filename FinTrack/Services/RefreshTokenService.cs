using System.Security.Cryptography;
using System.Text;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Services;

public record IssuedRefreshToken(
    string Token,
    DateTime ExpiresAtUtc);

public record RefreshTokenRotationResult(
    User User,
    string Token,
    DateTime ExpiresAtUtc);

public class RefreshTokenService
{
    private const int TokenSizeBytes = 64;
    private readonly ApplicationContext _context;
    private readonly TimeSpan _refreshTokenLifetime;

    public RefreshTokenService(ApplicationContext context, IConfiguration configuration)
    {
        _context = context;
        var expireDaysValue = configuration["Auth:RefreshTokenExpireDays"];
        if (!int.TryParse(expireDaysValue, out var expireDays) || expireDays <= 0)
            throw new InvalidOperationException("Refresh token expiration is not configured correctly");
        _refreshTokenLifetime = TimeSpan.FromDays(expireDays);
    }

    public async Task<IssuedRefreshToken> IssueAsync(Guid userId)
    {
        var rawToken = GenerateToken();
        var now = DateTime.UtcNow;
        var expiresAtUtc = now.Add(_refreshTokenLifetime);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = HashToken(rawToken),
            FamilyId = Guid.NewGuid(),
            CreatedAtUtc = now,
            ExpiresAtUtc = expiresAtUtc
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
        return new IssuedRefreshToken(rawToken, expiresAtUtc);
    }

    public async Task<RefreshTokenRotationResult?> RotateAsync(string rawToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken))
            return null;

        var tokenHash = HashToken(rawToken);

        var existing = await _context.RefreshTokens
            .Include(x => x.User).SingleOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (existing == null)
            return null;

        var now = DateTime.UtcNow;

        if (existing.RevokedAtUtc.HasValue)
        {
            if (existing.ReplacedByTokenId.HasValue)
                await RevokeFamilyAsync(existing.UserId, existing.FamilyId);

            return null;
        }

        if (existing.ExpiresAtUtc <= now)
        {
            existing.RevokedAtUtc = now;
            await _context.SaveChangesAsync();
            return null;
        }

        var newRawToken = GenerateToken();
        var newExpiresAtUtc = now.Add(_refreshTokenLifetime);
        
        var replacement = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = existing.UserId,
            TokenHash = HashToken(newRawToken),
            FamilyId = existing.FamilyId,
            CreatedAtUtc = now,
            ExpiresAtUtc = newExpiresAtUtc
        };
        existing.RevokedAtUtc = now;
        existing.ReplacedByTokenId = replacement.Id;

        _context.RefreshTokens.Add(replacement);
        await _context.SaveChangesAsync();

        return new RefreshTokenRotationResult(
            existing.User,
            newRawToken,
            newExpiresAtUtc);
    }

    public async Task RevokeAsync(string rawToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken))
            return;

        var tokenHash = HashToken(rawToken);

        var refreshToken = await _context.RefreshTokens
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (refreshToken == null || refreshToken.RevokedAtUtc.HasValue)
            return;

        refreshToken.RevokedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private async Task RevokeFamilyAsync(Guid userId, Guid familyId)
    {
        var now = DateTime.UtcNow;
        await _context.RefreshTokens.Where(x => x.UserId == userId &&
            x.FamilyId == familyId && x.RevokedAtUtc == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty( x => x.RevokedAtUtc, now));
    }

    private static string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(TokenSizeBytes);
        return Convert.ToHexString(bytes);
    }

    private static string HashToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash);
    }
}