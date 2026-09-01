import { Account } from "./account";

export interface SavingGoalRequest {
    name: string;
    targetAmount: number;
    currencyCode: string;
    targetDate: string | null;
    accountIds: string[];
}

export interface SavingGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    progressPercent: number;
    currencyCode: string;
    targetDate: string | null; 
    isCompleted: boolean;
    isArchived: boolean;
    accounts: Account[];
    creationTimeAtUtc: string;
    updateTimeAtUtc: string;
}