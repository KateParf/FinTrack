export interface SavingGoalRequest {
    name: string;
    targetAmount: number;
    currencyCode: string;
    targetDate: string; 
}

export interface SavingGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    currencyCode: string;
    targetDate: string; 
    isArchived: boolean;
    creationTimeAtUtc: string;
}

export interface GoalContributionRequest {
    type: number;
    amount: number;
    occurredAtUtc: number;
    note: string;
    transactionId: string;
}

export interface GoalContribution {
    id: string;
    goalId: string;
    type: number;
    amount: number;
    occurredAtUtc: number;
    note: string;
    transactionId: string;
    creationTimeAtUtc: string;
}