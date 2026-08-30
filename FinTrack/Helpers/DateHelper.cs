using System.Globalization;

namespace FinTrack.Helpers;

public static class DateHelper
{
    public static DateTime NormalizeOccurredAt(DateTime occurredAtUtc)
    {
        return occurredAtUtc == default ? DateTime.UtcNow : occurredAtUtc;
    }

    public static DateTime FirstDateOfIsoWeek(int year, int week)
    {
        var januaryFourth = new DateTime(year, 1, 4);
        var daysOffset = DayOfWeek.Thursday - januaryFourth.DayOfWeek;
        var firstThursday = januaryFourth.AddDays(daysOffset);
        var firstWeek = ISOWeek.GetWeekOfYear(firstThursday);

        if (firstWeek == 1)
            week -= 1;

        return firstThursday.AddDays(week * 7 - 3);
    }
}
