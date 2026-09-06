import { getAccessToken } from "../auth/accessTokenStore";
import { refreshAccessToken } from "../auth/authSession";

export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
    }
}

export async function createApiError(response: Response): Promise<ApiError> {
    const text = await response.text();
    let message = `Ошибка сервера (${response.status})`;
    if (text) {
        try {
            const body = JSON.parse(text) as {
                error?: string;
                title?: string;
            };
            message = body.error ?? body.title ?? text;
        } catch {
            message = text;
        }
    }
    return new ApiError(response.status, message);
}

async function sendRequest<T>(path: string, options: RequestInit, allowRefresh: boolean): Promise<T> {
    const headers = new Headers(options.headers);
    const token = getAccessToken();

    if (token)
        headers.set("Authorization", `Bearer ${token}`);

    if (options.body && !(options.body instanceof FormData))
        headers.set("Content-Type", "application/json");

    const response = await fetch(`/api/${path}`, {
        ...options,
        headers
    });

    if (response.status === 401 && allowRefresh) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken)
            return sendRequest<T>(path, options, false);
    }

    if (!response.ok)
        throw await createApiError(response);

    if (response.status === 204)
        return undefined as T;

    return response.json();
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    return sendRequest<T>(path, options, true);
}