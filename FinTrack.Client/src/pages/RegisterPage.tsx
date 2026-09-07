import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { currenciesLabelsLocales } from "../utils/formatMoney";

export function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [baseCurrency, setBaseCurrency] = useState("RUB");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const currencyOptions = Object.entries(currenciesLabelsLocales).map(
        ([cur, loc], idx) => { return <option key={idx} value={cur}>{cur}</option>; });

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
        <div className="align-content-center vh-100">
            <div className="d-flex flex-column align-items-center">
                <form className="card col-3 py-3" onSubmit={handleSubmit}>
                    <div className="card-body">
                        <h3 className="card-title text-center mb-3">Регистрация</h3>

                        <div className="card-text form-floating">
                            <input id="name" className="form-control" value={name} placeholder="Имя"
                                onChange={event =>
                                    setName(event.target.value)
                                }
                                required />
                                <label className="form-label" htmlFor="name">Имя</label>
                        </div>
                        

                        <div className="card-text form-floating">
                            <input id="email" className="form-control" type="email" value={email} placeholder="name@example.com"
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

                        <div className="card-text form-floating">                            
                            <select id="currency" value={baseCurrency} className="form-select"
                                onChange={event =>
                                    setBaseCurrency(event.target.value)
                                }
                                required>
                                {currencyOptions}
                            </select>
                            <label htmlFor="baseCurrency" className="form-label">Основная валюта</label>
                        </div>

                        {error && (<p className="alert alert-danger mt-4">{error}</p>)}

                        <button className="btn card-btn w-100" type="submit" disabled={isLoading}>
                            {isLoading ? "Регестрируем..." : "Зарегестрироваться"}
                        </button>
                    </div>
                </form>
                <p className="card-text col-auto m-2">Уже есть аккаунт?</p>
                <Link className="btn card-btn col-1" to="/login">Войти</Link>
            </div>
        </div>
    );
}
