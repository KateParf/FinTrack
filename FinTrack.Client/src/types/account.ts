export interface CreateAccountRequest {
    name: string;
    type: number;
    currencyCode: string;
    openingBalance: number;
}

export interface UpdateAccountRequest {
    name?: string;
    type?: AccountType;
}

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    currencyCode: string;
    balance: number;
    isArchived: boolean;
    creationTimeAtUtc: string;
    updateTimeAtUtc: string;
}

export enum AccountType {
    Cash = 1,
    DebitCard = 2,
    Savings = 3,
    Deposit = 4,
    Other = 5
}

export const accountTypeLabels: Record<AccountType, string> = {
    [AccountType.Cash]: "Наличные",
    [AccountType.DebitCard]: "Карта",
    [AccountType.Savings]: "Накопительный счёт",
    [AccountType.Deposit]: "Вклад",
    [AccountType.Other]: "Другое"
};

export type AccountOption = {
    value: string;
    label: string;
};
