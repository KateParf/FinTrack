import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }: PropsWithChildren) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return <p>Загрузка...</p>;
    }
    if (!isAuthenticated) {
        return (<Navigate to="/login" replace />);
    }
    return children;
}