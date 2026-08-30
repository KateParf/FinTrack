export interface Summary {
    income: number; 
    expenses: number; 
    savings: number; 
}

export interface Expenses {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
}

export interface BalanceHistory {
    date: string;
    amount: number;
}