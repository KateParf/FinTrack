export interface Transaction {
    id: string;
    accountId: string;
    accountName: string;
    type: TransactionType;
    note: string | null;
    categoryId: string | null;
    categoryName: string | null;
    transferGroupId: string | null;
    amount: number;
    occurredAtUtc: string;
    creationTimeAtUtc: string;
    updateTimeAtUtc: string;
}

export interface TransactionRequest {
    accountId: string;
    type: TransactionType;
    categoryId: string | null;
    amount: number;
    occurredAtUtc: string;
    note: string | null;
}

export enum TransactionType {
    Income = 1,
    Expense = 2,
    TransferOut = 3,
    TransferIn = 4
}

export const transactionTypeLabels: Record<TransactionType, string> = {
    [TransactionType.Income]: "Доход",
    [TransactionType.Expense]: "Расход",
    [TransactionType.TransferOut]: "Перевод со счёта",
    [TransactionType.TransferIn]: "Перевод на счёт"
};