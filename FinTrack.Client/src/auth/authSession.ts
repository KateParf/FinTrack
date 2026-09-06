import { refresh } from "../api/authApi";
import { ApiError } from "../api/apiClient";
import { clearAccessToken, setAccessToken } from "./accessTokenStore";

let refreshPromise: Promise<string | null> | null = null;

const sessionExpiredListeners = new Set<() => void>();

export function subscribeToSessionExpired(listener: () => void): () => void {
    sessionExpiredListeners.add(listener);
    return () => {
        sessionExpiredListeners.delete(listener);
    };
}

function notifySessionExpired(): void {
    sessionExpiredListeners.forEach(listener => listener());
}

async function performRefresh(): Promise<string | null> {
    try {
        const response = await refresh();
        setAccessToken(response.accessToken);
        return response.accessToken;
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            clearAccessToken();
            notifySessionExpired();
            return null;
        }
        throw error;
    }
}

export function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}