import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { register } from "../api/authApi";
import { saveAccessToken } from "../auth/tokenStorage";
import { AuthResponse } from "../types/auth";
import { useAuth } from "../auth/AuthContext";

export function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [baseCurrency, setBaseCurrency] = useState("RUB");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const currs = ["RUB", "USD", "EUR", "BYN", "KZT", "AMD", "KGS", "MDL", "TJS", "CNY"];
    const options = currs.map((cur, idx) => { return <option key={idx} value={cur}>{cur}</option>; });

    const { signUp } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await signUp({
                name,
                email,
                password,
                baseCurrency
            });
            navigate("/");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось зарегестрироваться");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1 className="card-title">Регистрация</h1>
                <div className="card-body">
                    <div className="card-text">
                        <label htmlFor="name">Имя </label>
                        <input id="name" value={name}
                            onChange={event =>
                                setName(event.target.value)
                            }
                            required />
                    </div>

                    <div className="card-text">
                        <label htmlFor="email">Email </label>
                        <input id="email" type="email" value={email}
                            onChange={event =>
                                setEmail(event.target.value)
                            }
                            required />
                    </div>

                    <div className="card-text">
                        <label htmlFor="password">Пароль </label>
                        <input id="password" type="password" value={password}
                            onChange={event =>
                                setPassword(event.target.value)
                            }
                            required />
                    </div>

                    <div className="card-text">
                        <label htmlFor="baseCurrency">Основная валюта </label>
                        <select id="currency" value={baseCurrency}
                            onChange={event =>
                                setBaseCurrency(event.target.value)
                            }
                            required>
                            {options}
                        </select>
                    </div>

                    {error && (<p>{error}</p>)}

                    <button className="card-btn" type="submit" disabled={isLoading}>
                        {isLoading ? "Регестрируем..." : "Зарегестрироваться"}
                    </button>
                </div>
            </form>

            <div>
                Уже есть аккаунт?{" "}
                <Link to="/login"> Войти </Link>
            </div>
        </main>
    );
}
