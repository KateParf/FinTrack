// TODO для всех валют

import { TransactionType } from "../types/transaction";

export function formatCurrency(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: currencyCode
    }).format(amount);
}

export function getTransactionSign(type: TransactionType): "+" | "-" {
    return type === TransactionType.Income || type === TransactionType.TransferIn ? "+" : "-";
}