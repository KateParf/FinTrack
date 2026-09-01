import { SavingGoal, SavingGoalRequest } from "../types/savingGoal";
import { apiRequest } from "./apiClient";


export async function getSavingGoals(includeArchived: boolean = false): Promise<SavingGoal[]> {
    const params = new URLSearchParams();
    if (includeArchived) params.set("includeArchived", "true");
    const query = params.toString();
    return apiRequest<SavingGoal[]>(
        `savinggoals${query ? `?${query}` : ""}`,
        {
            method: "GET"
        }
    );
}

export async function getSavingGoalByID(id: string): Promise<SavingGoal> {
    return apiRequest<SavingGoal>(`savinggoals/${id}`, {
        method: "GET"
    });
}

export async function createSavingGoal(request: SavingGoalRequest): Promise<SavingGoal> {
    return apiRequest<SavingGoal>("savinggoals", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function updateSavingGoal(id: string, request: SavingGoalRequest): Promise<SavingGoal> {
    return apiRequest<SavingGoal>(`savinggoals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(request)
    });
}

export async function archiveSavingGoal(id: string): Promise<void> {
    return apiRequest<void>(`savinggoals/${id}/archive`, {
        method: "POST"
    });
}

export async function restoreSavingGoal(id: string): Promise<void> {
    return apiRequest<void>(`savinggoals/${id}/restore`, {
        method: "POST"
    });
}