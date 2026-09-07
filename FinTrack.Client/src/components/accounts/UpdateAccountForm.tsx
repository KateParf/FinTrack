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
        <form className="card-body" onSubmit={handleSubmit}>
            <div className="row align-items-end">

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

                <div className="col-lg-4">
                    <div className="d-flex gap-2 justify-content-end">
                        <button className="btn card-btn" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Обновляем..." : "Обновить"}
                        </button>
                        <button className="btn" type="button" onClick={onCancel} disabled={isSubmitting}>
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
