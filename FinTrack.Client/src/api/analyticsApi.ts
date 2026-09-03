import { BalanceHistory, Expenses, Summary } from "../types/analytics";
import { apiRequest } from "./apiClient";


export interface Filters {
    accountId?: string | null;
    from?: string | null;
    to?: string | null;
}

export async function getSummary(): Promise<Summary[]> {
    return apiRequest<Summary[]>("analytics/summary", {
        method: "GET"
    });
}

export async function getExpensesByCategory(filters: Filters = {}): Promise<Expenses[]> {
    const params = new URLSearchParams();
    if (filters.accountId != null) params.set("accountId", filters.accountId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const query = params.toString();
    return apiRequest<Expenses[]>(
        `analytics/expenses-by-category${query ? `?${query}` : ""}`,
        {
            method: "GET"
        }
    );
}

export async function getBalanceHistory(filters: Filters = {}, groupBy: string): Promise<BalanceHistory[]> {
    const params = new URLSearchParams();
    if (filters.accountId != null) params.set("accountId", filters.accountId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    params.set("groupBy", groupBy);
    const query = params.toString();
    return apiRequest<BalanceHistory[]>(
        `analytics/balance-history?${query}`,
        {
            method: "GET"
        }
    );
}