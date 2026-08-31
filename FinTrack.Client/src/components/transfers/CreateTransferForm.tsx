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
        <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
                <div className="card-text">
                    <label htmlFor="transfer-to-account">На счёт </label>
                    <select id="transfer-to-account" value={toAccountId}
                        onChange={event => setToAccountId(event.target.value)} required>
                        <option value={""}>Выберите счёт</option>   
                        {availableAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="transfer-amount">Сумма </label>
                    <input id="transfer-amount" type="number" min="0.01" step="0.01"
                        value={amount} onChange={event => setAmount(event.target.value)}
                        required /> {account.currencyCode}
                </div>

                <div className="card-text">
                    <label htmlFor="transfer-date">Дата </label>
                    <input id="transfer-date" type="datetime-local"
                        value={occurredAt} onChange={event => setOccurredAt(event.target.value)}
                        required />
                </div>

                <div className="card-text">
                    <label htmlFor="transfer-note">Комментарий </label>
                    <input id="transfer-note" value={note} onChange={event => setNote(event.target.value)}/>
                </div>

                {error && <p>{error}</p>}

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Переводим..." : "Добавить перевод"}</button>
            </div>
        </form>
    );
}