import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { LoginRequest, RegistrationRequest } from "../types/auth";
import { User } from "../types/user";
import { clearAccessToken, setAccessToken } from "./accessTokenStore";
import { refreshAccessToken, subscribeToSessionExpired } from "./authSession";
import { getCurrentUser } from "../api/usersApi";
import { login, logout, register } from "../api/authApi";

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    signIn(request: LoginRequest): Promise<void>;
    signUp(request: RegistrationRequest): Promise<void>;
    signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = user !== null;

    useEffect(() => {
        let disposed = false;

        const unsubscribe = subscribeToSessionExpired(() => {
            if (!disposed)
                setUser(null);
        });

        async function restoreUser() {
            try {
                const token = await refreshAccessToken();
                if (!token)
                    return;

                const currentUser = await getCurrentUser();

                if (!disposed)
                    setUser(currentUser);

            } catch {
                clearAccessToken();

                if (!disposed)
                    setUser(null);

            } finally {
                if (!disposed) {
                    setIsLoading(false);
                }
            }
        }

        void restoreUser();

        return () => {
            disposed = true;
            unsubscribe();
        };
    }, []);

    async function completeAuthentication(accessToken: string): Promise<void> {
        setAccessToken(accessToken);

        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            clearAccessToken();
            setUser(null);
            try {
                await logout();
            } catch {}
            throw error;
        }
    }

    async function signIn(request: LoginRequest): Promise<void> {
        const response = await login(request);
        await completeAuthentication(response.accessToken);
    }

    async function signUp(request: RegistrationRequest): Promise<void> {
        const response = await register(request);
        await completeAuthentication(response.accessToken);
    }

    async function signOut(): Promise<void> {
        await logout();
        clearAccessToken();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                signIn,
                signUp,
                signOut
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside AuthProvider");
    return context;
}