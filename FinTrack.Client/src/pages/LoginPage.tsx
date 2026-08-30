import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await signIn({
                email,
                password
            });
            navigate("/");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось войти");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1 className="card-title">Вход</h1>
                <div className="card-body">
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

                    {error && (<p>{error}</p>)}

                    <button className="card-btn" type="submit" disabled={isLoading}>{isLoading ? "Входим..." : "Войти"}</button>
                </div>
            </form>

            <div>
                Нет аккаунта?{" "}
                <Link to="/register"> Зарегистрироваться </Link>
            </div>

        </main>
    );
}
