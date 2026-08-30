export function formatDateTime(date: string): string {
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(date));
}

export function toStartOfDayUtc(date: string): string | null {
    if (!date) return null;
    const value = new Date(`${date}T00:00:00`);
    return value.toISOString();
}

export function toEndOfDayUtc(date: string): string | null {
    if (!date) return null;
    const value = new Date(`${date}T23:59:59.999`);
    return value.toISOString();
}