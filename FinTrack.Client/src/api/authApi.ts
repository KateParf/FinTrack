import { AuthResponse, LoginRequest, RegistrationRequest } from "../types/auth";
import { apiRequest } from "./apiClient";

export async function login(request: LoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("auth/login", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function register(request: RegistrationRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("auth/register", {
        method: "POST",
        body: JSON.stringify(request)
    });
}