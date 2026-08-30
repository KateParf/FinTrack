import { getAccessToken } from "../auth/tokenStorage";

export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
    }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const token = getAccessToken();
    if (token)
        headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData))
        headers.set("Content-Type", "application/json");

    const response = await fetch(`/api/${path}`,
        {
            ...options,
            headers
        }
    );

    if (!response.ok)
        throw new ApiError(response.status, `API request failed: ${response.status}`);
    if (response.status === 204) return undefined as T;
    return response.json();
}