import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AccountsPage } from "./AccountsPage";

export function HomePage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        signOut();
        navigate("/login");
    }
    function handleLogin() {
        navigate("/login");
    }
    function handleRegister() {
        navigate("/register");
    }
    function handleAccounts() {
        navigate("/accounts");
    }
    function handleCategories() {
        navigate("/categories");
    }

    return (
        <main>
            <h1>FinTrack</h1>
            <h2>Приложение для учета личных финансов</h2>
            <h3>Привет, {user?.name}</h3>

            <br/>

            <button onClick={handleLogin}>Войти</button>
            <button onClick={handleRegister}>Зарегистрироваться</button>
            <button onClick={handleLogout}>Выйти</button>

            <br/>

            <button onClick={handleAccounts}>Счета</button>
            <button onClick={handleCategories}>Категории</button>
        </main>
    );
}