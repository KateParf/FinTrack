import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { currenciesLabelsLocales } from "../utils/formatMoney";

export function UserPage() {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState("");
    const [baseCurrency, setBaseCurrency] = useState("RUB");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!user)
            return;
        setName(user.name);
        setBaseCurrency(user.baseCurrency);
    }, [user]);

    if (!user)
        return null;

    const currencyOptions = Object.keys(currenciesLabelsLocales).map(currency => (
        <option key={currency} value={currency}>{currency}</option>
    ));

    const initial = user.name.trim().charAt(0).toUpperCase();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await updateProfile({ name, baseCurrency });
            setSuccess("Изменения сохранены");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось обновить данные пользователя");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-3 align-content-center vh-100">

            <div className="mb-4">
                <h2 className="mb-1">Профиль</h2>
                <div className="text-secondary">Личные данные и основные настройки</div>
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card m-0 h-100">
                        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                            <div className="user-avatar mb-3">{initial}</div>
                            <h4 className="card-title mb-1">{user.name}</h4>
                            <div className="text-secondary mb-3">{user.email}</div>
                            <div className="small text-secondary">Основная валюта</div>
                            <div className="fs-5 fw-semibold">{user.baseCurrency}</div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <form className="card m-0 h-100" onSubmit={handleSubmit}>
                        <div className="card-body">
                            <h2 className="h4 card-title mb-4">Личные данные</h2>

                            <div className="form-floating mb-3">
                                <input id="profile-name" className="form-control"
                                    value={name} placeholder="Имя"
                                    onChange={event => {
                                        setName(event.target.value);
                                        setSuccess(null);
                                    }}
                                    required />
                                <label htmlFor="profile-name">Имя</label>
                            </div>

                            <div className="form-floating mb-4">
                                <select id="profile-currency" className="form-select" value={baseCurrency}
                                    onChange={event => {
                                        setBaseCurrency(event.target.value);
                                        setSuccess(null);
                                    }}>
                                    {currencyOptions}
                                </select>
                                <label htmlFor="profile-currency">Основная валюта</label>
                            </div>

                            {error &&
                                <div className="alert alert-danger">{error}</div>
                            }

                            {success &&
                                <div className="alert alert-success">{success}</div>
                            }

                            <div className="d-flex justify-content-end">
                                <button className="btn card-btn" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Сохраняем..." : "Сохранить изменения"}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}