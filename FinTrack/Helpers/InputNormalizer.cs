using System.Net.Mail;

namespace FinTrack.Helpers;

public static class InputNormalizer
{
    public static string NormalizeName(string name, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException($"{fieldName} is required");

        return name.Trim();
    }

    public static string NormalizeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidOperationException("Email is required");
        try
        {
            // Parses and strips surrounding whitespace automatically
            var addr = new MailAddress(email.Trim());
            // Local part (case-sensitive per RFC), Domain part (case-insensitive)
            var host = addr.Host.ToLowerInvariant();
            var normalized = $"{addr.User}@{host}";
            return normalized;
        }
        catch
        {
            throw new InvalidOperationException("Incorrect email format");
        }
    }

    public static string NormalizeCurrencyCode(string currencyCode)
    {
        if (string.IsNullOrWhiteSpace(currencyCode))
            throw new InvalidOperationException("Currency code is required");

        var normalized = currencyCode.Trim().ToUpperInvariant();
        if (normalized.Length != 3)
            throw new InvalidOperationException("Currency code must contain 3 characters");

        return normalized;
    }

    public static string? NormalizeNote(string? note)
    {
        return string.IsNullOrWhiteSpace(note) ? null : note.Trim();
    }
}
