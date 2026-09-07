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
        <div className="align-content-center vh-100">
            <div className="d-flex flex-column align-items-center">
                <form className="card col-3 py-3" onSubmit={handleSubmit}>
                    <div className="card-body">
                        <h3 className="card-title text-center mb-3">Вход</h3>
                        <div className="card-text form-floating">
                            <input className="form-control" id="email" type="email" value={email} placeholder="name@example.com"
                                onChange={event =>
                                    setEmail(event.target.value)
                                }
                                required />
                            <label className="form-label" htmlFor="email">Email</label>
                        </div>

                        <div className="card-text form-floating">
                            <input className="form-control" id="password" type="password" value={password} placeholder="Password_123"
                                onChange={event =>
                                    setPassword(event.target.value)
                                }
                                required />
                            <label className="form-label" htmlFor="password">Пароль</label>
                        </div>

                        {error && (<p className="alert alert-danger mt-4">{error}</p>)}

                        <button className="btn card-btn w-100" type="submit" disabled={isLoading}>{isLoading ? "Входим..." : "Войти"}</button>
                    </div>
                </form>
                <p className="card-text col-auto m-2">Нет аккаунта?</p>
                <Link className="btn card-btn col-auto" to="/register">Зарегистрироваться</Link>
            </div>
        </div>
    );
}
