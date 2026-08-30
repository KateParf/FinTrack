using System.Security.Claims;

namespace FinTrack.Helpers;

public static class ApiUserHelper
{
    public static Guid GetCurrentUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            throw new InvalidOperationException("Current user id is not a valid Guid");
        }

        return parsedUserId;
    }
}
