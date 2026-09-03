export interface Summary {
    currencyCode: string;
    income: number; 
    expenses: number; 
    savings: number; 
}

export interface Expenses {
    categoryId: string;
    categoryName: string;
    currencyCode: string;
    amount: number;
    percentage: number;
}

export interface BalanceHistory {
    currencyCode: string;
    date: string;
    amount: number;
}