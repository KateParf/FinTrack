import { FormEvent, useState } from "react";
import { Account } from "../../types/account";
import { createTransfer } from "../../api/transfersApi";

interface CreateTransferFormProps {
    account: Account;
    accounts: Account[];
    onCreate: () => Promise<void>;
}

export function CreateTransferForm({ account, accounts, onCreate }: CreateTransferFormProps) {
    const [toAccountId, setToAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [occurredAt, setOccurredAt] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableAccounts = accounts.filter(candidate => candidate.id !== account.id &&
        !candidate.isArchived && candidate.currencyCode === account.currencyCode);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        if (!toAccountId) {
            setError("Выберите счёт для перевода");
            return;
        }
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError("Введите корректную сумму");
            return;
        }
        if (!occurredAt) {
            setError("Укажите дату операции");
            return;
        }
        setIsSubmitting(true);
        try {
            await createTransfer({
                fromAccountId: account.id,
                toAccountId,
                amount: parsedAmount,
                occurredAtUtc: new Date(occurredAt).toISOString(),
                note: note.trim() || null
            });
            await onCreate();
            setToAccountId("");
            setAmount("");
            setOccurredAt("");
            setNote("");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось осуществить перевод");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <article className="card col-12 ms-0 mb-3">
            <form className="card-body" onSubmit={handleSubmit}>
                <div className="row align-items-end">

                    <div className="col">
                        <label htmlFor="transfer-to-account" className="form-label">На счёт</label>
                        <select id="transfer-to-account" value={toAccountId} className="form-select"
                            onChange={event => setToAccountId(event.target.value)} required>
                            <option value={""}>Выберите счёт</option>
                            {availableAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-2">
                        <label htmlFor="transfer-amount" className="form-label">Сумма ({account.currencyCode})</label>
                        <input id="transfer-amount" type="number" min="0.01" step="0.01" className="form-control"
                            value={amount} onChange={event => setAmount(event.target.value)}
                            required />
                    </div>

                    <div className="col">
                        <label htmlFor="transfer-date" className="form-label">Дата</label>
                        <input id="transfer-date" type="datetime-local" className="form-control"
                            value={occurredAt} onChange={event => setOccurredAt(event.target.value)}
                            required />
                    </div>

                    <div className="col-lg-4">
                        <label htmlFor="transfer-note" className="form-label">Комментарий</label>
                        <input id="transfer-note" className="form-control" value={note}
                            onChange={event => setNote(event.target.value)} />
                    </div>

                    <div className="col-lg-1">
                        <button className="btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Создать"}</button>
                    </div>
                </div>
                {error && <p className="alert alert-danger mt-4">{error}</p>}
            </form>
        </article>
    );
}