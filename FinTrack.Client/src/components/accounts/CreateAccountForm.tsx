import { FormEvent, useState } from "react";
import { createAccount } from "../../api/accountsApi";
import { Account, AccountType, accountTypeLabels } from "../../types/account";

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
    const currs = ["RUB", "USD", "EUR", "BYN", "KZT", "AMD", "KGS", "MDL", "TJS", "CNY"];
    const currencyOptions = currs.map((cur, idx) => { return <option key={idx} value={cur}>{cur}</option>; });

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
        <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
                <div className="card-text">
                    <label htmlFor="name">Название </label>
                    <input id="name" value={name}
                        onChange={event =>
                            setName(event.target.value)
                        }
                        required />
                </div>

                <div className="card-text">
                    <label htmlFor="type">Тип </label>
                    <select id="type" value={type}
                        onChange={event => {
                            const value = event.target.value;
                            setType(Number(value) as AccountType)
                        }}>
                        {typeOptions}
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="baseCurrency">Валюта </label>
                    <select id="currency" value={currencyCode}
                        onChange={event =>
                            setCurrencyCode(event.target.value)
                        }
                        required>
                        {currencyOptions}
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="openingBalance">Начальный баланс </label>
                    <input id="openingBalance" type="number" min="0" step="0.01" value={openingBalance}
                        onChange={event =>
                            setBalance(event.target.value)
                        }
                    required />
                </div>

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Создать"}</button>
            </div>
        </form>
    );
}
