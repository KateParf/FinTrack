import { Transfer, TransferRequest } from "../types/transfer";
import { apiRequest } from "./apiClient";


export async function getTransferByGroupId(id: string): Promise<Transfer> {
    return apiRequest<Transfer>(`transfers/${id}`, {
        method: "GET"
    });
}

export async function createTransfer(request: TransferRequest): Promise<Transfer> {
    return apiRequest<Transfer>("transfers", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function updateTransfer(id: string, request: TransferRequest): Promise<Transfer> {
    return apiRequest<Transfer>(`transfers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(request)
    });
}

export async function deleteTransfer(id: string): Promise<void> {
    return apiRequest<void>(`transfers/${id}`, {
        method: "DELETE"
    });
}