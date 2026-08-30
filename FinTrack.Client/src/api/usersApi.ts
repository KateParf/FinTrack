import { User, UserRequest } from "../types/user";
import { apiRequest } from "./apiClient";

export async function getCurrentUser(): Promise<User> {
    return apiRequest<User>("users/me", {
        method: "GET"
    });
}

export async function updateUser(request: UserRequest): Promise<User> {
    return apiRequest<User>("users/me", {
        method: "PATCH",
        body: JSON.stringify(request)
    });
}