// TODO для всех валют

import { TransactionType } from "../types/transaction";

export function formatCurrency(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat(currenciesLabelsLocales[currencyCode], {
        style: "currency",
        currency: currencyCode
    }).format(amount);
}

export function getTransactionSign(type: TransactionType): "+" | "-" {
    return type === TransactionType.Income || type === TransactionType.TransferIn ? "+" : "-";
}

export const currenciesLabelsLocales: Record<string, string> = {
    "RUB": "ru-RU",
    "USD": "en-US",
    "EUR": "es-ES",
    "BYN": "ru-BY",
    "KZT": "ru-KZ",
    "UZS": "ru-UZ",
    "AMD": "ru-AM",
    "KGS": "ru-KG",
    "MDL": "ru-MD",
    "TJS": "ru-TJ",
    "CNY": "zh-CN",
};