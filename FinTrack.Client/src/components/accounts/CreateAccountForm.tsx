import { FormEvent, useState } from "react";
import { createAccount } from "../../api/accountsApi";
import { AccountType, accountTypeLabels } from "../../types/account";
import { currenciesLabelsLocales } from "../../utils/formatMoney";

interface CreateAccountFormProps {
    onCreate: () => Promise<void>;
}

export function CreateAccountForm({ onCreate }: CreateAccountFormProps) {
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<AccountType>(AccountType.Other);
    const [currencyCode, setCurrencyCode] = useState("RUB");
    const [openingBalance, setBalance] = useState<string>("0");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const typeOptions = Object.entries(accountTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>{label}</option>
    ));
    
    const currencyOptions = Object.entries(currenciesLabelsLocales).map(
        ([cur, loc], idx) => { return <option key={idx} value={cur}>{cur}</option>; });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        const balance = Number(openingBalance);
        if (!Number.isFinite(balance) || balance <= 0) {
            setError("Введите корректный начальный баланс");
            return;
        }
        setIsSubmitting(true);
        try {
            await createAccount({
                name,
                type,
                currencyCode,
                openingBalance: balance
            });
            await onCreate();
            setName("");
            setType(AccountType.Other);
            setCurrencyCode("RUB");
            setBalance("0");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось создать счёт");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <article className="card col-12 ms-0 mb-3">
            <form className="card-body" onSubmit={handleSubmit}>
                <div className="row align-items-end g-3">

                    <div className="col-lg-6">
                        <label htmlFor="name" className="form-label">Название </label>
                        <input id="name" value={name} className="form-control"
                            onChange={event =>
                                setName(event.target.value)
                            }
                            required />
                    </div>

                    <div className="col-lg-2">
                        <label htmlFor="type" className="form-label">Тип</label>
                        <select id="type" value={type} className="form-select"
                            onChange={event => {
                                const value = event.target.value;
                                setType(Number(value) as AccountType)
                            }}>
                            {typeOptions}
                        </select>
                    </div>

                    <div className="col-lg-1">
                        <label htmlFor="baseCurrency" className="form-label">Валюта </label>
                        <select id="currency" value={currencyCode} className="form-select"
                            onChange={event =>
                                setCurrencyCode(event.target.value)
                            }
                            required>
                            {currencyOptions}
                        </select>
                    </div>

                    <div className="col-lg-2">
                        <label htmlFor="openingBalance" className="form-label">Начальный баланс </label>
                        <input id="openingBalance" type="number" min="0" step="0.01" value={openingBalance}
                            className="form-control"
                            onChange={event =>
                                setBalance(event.target.value)
                            }
                            required />
                    </div>
                    <div className="col-lg-1">
                        <button className="btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Создать"}</button>
                    </div>
                </div>
            </form>
        </article>
    );
}
