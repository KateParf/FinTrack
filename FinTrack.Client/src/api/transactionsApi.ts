import { Transaction, TransactionRequest, TransactionType } from "../types/transaction";
import { apiRequest } from "./apiClient";

export interface TransactionFilters {
    type?: TransactionType | null;
    categoryId?: string | null;
    from?: string | null;
    to?: string | null;
}

export async function getTransactions(accountId: string, filters: TransactionFilters = {}): Promise<Transaction[]> {
    const params = new URLSearchParams();
    params.set("accountId", accountId);
    if (filters.type != null) params.set("type", filters.type.toString());
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const query = params.toString();
    return apiRequest<Transaction[]>(
        `transactions?${query}`,
        {
            method: "GET"
        }
    );
}

export async function getTransactionById(id: string): Promise<Transaction> {
    return apiRequest<Transaction>(`transactions/${id}`, {
        method: "GET"
    });
}

export async function createTransaction(request: TransactionRequest): Promise<Transaction> {
    return apiRequest<Transaction>("transactions", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function updateTransaction(id: string, request: TransactionRequest): Promise<Transaction> {
    return apiRequest<Transaction>(`transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(request)
    });
}

export async function deleteTransaction(id: string): Promise<void> {
    return apiRequest<void>(`transactions/${id}`, {
        method: "DELETE"
    });
}