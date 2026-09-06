import { AuthResponse, LoginRequest, RegistrationRequest } from "../types/auth";
import { apiRequest } from "./apiClient";
import { createApiError } from "./apiClient";

export async function login(request: LoginRequest): Promise<AuthResponse> {
    return authRequest<AuthResponse>("login", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function register(request: RegistrationRequest): Promise<AuthResponse> {
    return authRequest<AuthResponse>("register", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

export async function refresh(): Promise<AuthResponse> {
    return authRequest<AuthResponse>("refresh", {
        method: "POST"
    });
}

export async function logout(): Promise<void> {
    return authRequest<void>("logout", {
        method: "POST"
    });
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body)
        headers.set("Content-Type", "application/json");

    const response = await fetch(`/api/auth/${path}`, {
        ...options,
        headers,
        credentials: "include"
    });

    if (!response.ok)
        throw await createApiError(response);

    if (response.status === 204)
        return undefined as T;

    return response.json();
}