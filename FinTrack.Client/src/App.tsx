import { Router, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AccountsPage } from "./pages/AccountsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { SavingGoalsPage } from "./pages/SavingGoalsPage";
import { Navbar } from "./components/navbar/NavBar";
import { UserPage } from "./pages/UserPage";
import { useAuth } from "./auth/AuthContext";

export function App() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="app-container d-flex">
             {isAuthenticated && <Navbar />}
            <main className="main-content vh-100 vw-100">
                <Routes>
                    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
                    <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
                    <Route path="/saving-goals" element={<ProtectedRoute><SavingGoalsPage /></ProtectedRoute>} />
                    <Route path="/categories" element={<ProtectedRoute><CategoriesPage /> </ProtectedRoute>} />
                    <Route path="/accounts/:accountId/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>

    );
}