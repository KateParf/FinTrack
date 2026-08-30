import { FormEvent, useState } from "react";
import { updateAccount } from "../../api/accountsApi";
import { Account, AccountType, accountTypeLabels, UpdateAccountRequest } from "../../types/account";

interface UpdateAccountFormProps {
    account: Account;
    onSave: (id: string, request: UpdateAccountRequest) => Promise<void>;
    onCancel: () => void;
}

export function UpdateAccountForm({ account, onSave, onCancel }: UpdateAccountFormProps) {
    const [name, setName] = useState(account.name);
    const [type, setType] = useState(account.type);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const typeOptions = Object.entries(accountTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>{label}</option>
    ));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await onSave(account.id, {
                name,
                type
            });
            onCancel();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось обновить счёт");
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

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Обновляем..." : "Обновить"}</button>
                <button className="card-btn" type="button" onClick={() => onCancel()}>Отмена</button>
            </div>
        </form>
    );
}
