export interface Transfer {
    transferGroupId: string;
    fromTransactionId: string;
    toTransactionId: string;
    fromAccountId: string;
    fromAccountName: string;
    toAccountId: string;
    toAccountName: string;
    currencyCode: string;
    amount: number;
    occurredAtUtc: string;
    note: string | null;
    creationTimeAtUtc: string;
    updateTimeAtUtc: string;
}

export interface TransferRequest {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    occurredAtUtc: string;
    note: string | null;
}