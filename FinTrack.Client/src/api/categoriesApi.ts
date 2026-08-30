import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/category";
import { apiRequest } from "./apiClient";

export async function getCategories(type: number | null, includeArchived: boolean = false): Promise<Category[]> {
    const params = new URLSearchParams();
    if (type !== null) params.set("type", type.toString());
    if (includeArchived) params.set("includeArchived", "true");
    const query = params.toString();
    return apiRequest<Category[]>(
        `categories${query ? `?${query}` : ""}`,
        {
            method: "GET"
        }
    );
}

export async function getCategoryById(id: string): Promise<Category> {
    return apiRequest<Category>(`categories/${id}`, {
        method: "GET"
    });
}

export async function createCategory(request: CreateCategoryRequest): Promise<Category> {
    return apiRequest<Category>("categories", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function updateCategory(id: string, request: UpdateCategoryRequest): Promise<Category> {
    return apiRequest<Category>(`categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(request)
    });
}

export async function archiveCategory(id: string): Promise<void> {
    return apiRequest<void>(`categories/${id}/archive`, {
        method: "POST"
    });
}

export async function restoreCategory(id: string): Promise<void> {
    return apiRequest<void>(`categories/${id}/restore`, {
        method: "POST"
    });
}