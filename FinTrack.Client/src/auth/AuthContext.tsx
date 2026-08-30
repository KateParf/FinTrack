import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { LoginRequest, RegistrationRequest } from "../types/auth";
import { User } from "../types/user";
import { getAccessToken, removeAccessToken, saveAccessToken } from "./tokenStorage";
import { getCurrentUser } from "../api/usersApi";
import { login, register } from "../api/authApi";

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn(request: LoginRequest): Promise<void>;
    signUp(request: RegistrationRequest): Promise<void>;
    signOut(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = user !== null;

    useEffect(() => {
        async function restoreUser() {
            const token = getAccessToken();
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                removeAccessToken();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        void restoreUser();
    }, []);

    async function signIn(request: LoginRequest): Promise<void> {
        const response = await login(request);
        saveAccessToken(response.accessToken);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            removeAccessToken();
            setUser(null);
            throw error;
        }
    }

    async function signUp(request: RegistrationRequest): Promise<void> {
        const response = await register(request);
        saveAccessToken(response.accessToken);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            removeAccessToken();
            setUser(null);
            throw error;
        }
    }

    function signOut(): void {
        removeAccessToken();
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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }
    return context;
}



