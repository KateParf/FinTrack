export interface CreateCategoryRequest {
    name: string;
    type: CategoryType;
    parentCategoryId: string | null;
}

export interface UpdateCategoryRequest {
    name?: string;
    parentCategoryId?: string | null;
}

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    parentCategoryId: string | null;
    isArchived: boolean;
    children: Category[];
}

export enum CategoryType {
    Income = 1,
    Expense = 2
}

export const categoryTypeLabels: Record<CategoryType, string> = {
    [CategoryType.Income]: "Доход",
    [CategoryType.Expense]: "Расход"
};