import { Account, UpdateAccountRequest, CreateAccountRequest } from "../types/account";
import { apiRequest } from "./apiClient";

export async function getAccounts(type: number | null, includeArchived: boolean = false): Promise<Account[]> {
    const params = new URLSearchParams();
    if (type != null) params.set("type", type.toString());
    if (includeArchived) params.set("includeArchived", "true");
    const query = params.toString();
    return apiRequest<Account[]>(
        `accounts${query ? `?${query}` : ""}`,
        {
            method: "GET"
        }
    );
}

export async function getAccountById(id: string): Promise<Account> {
    return apiRequest<Account>(`accounts/${id}`, {
        method: "GET"
    });
}

export async function createAccount(request: CreateAccountRequest): Promise<Account> {
    return apiRequest<Account>("accounts", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function updateAccount(id: string, request: UpdateAccountRequest): Promise<Account> {
    return apiRequest<Account>(`accounts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(request)
    });
}

export async function archiveAccount(id: string): Promise<void> {
    return apiRequest<void>(`accounts/${id}/archive`, {
        method: "POST"
    });
}

export async function restoreAccount(id: string): Promise<void> {
    return apiRequest<void>(`accounts/${id}/restore`, {
        method: "POST"
    });
}