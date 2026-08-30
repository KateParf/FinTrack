export interface Transfer {
    transferGroupId: string;
    fromTransactionId: string;
    toTransactionId: string;
    fromAccountId: string;
    fromAccountName: string;
    toAccountId: string;
    toAccountNAme: string;
    currencyCode: string;
    amount: number;
    occurredAtUtc: string;
    note: string;
    creationTimeAtUtc: string;
    updateTimeAtUtc: string;
}

export interface TransferRequest {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    occurredAtUtc: string;
    note: string;
}