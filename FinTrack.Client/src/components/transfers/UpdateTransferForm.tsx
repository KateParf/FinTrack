import { FormEvent, useState } from "react";
import { Transfer } from "../../types/transfer";
import { Account } from "../../types/account";
import { toDateTimeLocal } from "../../utils/formatDateTime";
import { updateTransfer } from "../../api/transfersApi";

interface UpdateTransferFormProps {
    transfer: Transfer;
    accounts: Account[];
    onUpdate: () => Promise<void>;
    onCancel: () => void;
}

export function UpdateTransferForm({ transfer, accounts, onUpdate, onCancel }: UpdateTransferFormProps) {
    const [fromAccountId, setFromAccountId] = useState(transfer.fromAccountId);
    const [toAccountId, setToAccountId] = useState(transfer.toAccountId);
    const [amount, setAmount] = useState(transfer.amount.toString());
    const [occurredAt, setOccurredAt] = useState(toDateTimeLocal(transfer.occurredAtUtc));
    const [note, setNote] = useState(transfer.note ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    let availableAccountsFrom = accounts.filter(candidate => candidate.id !== toAccountId &&
        !candidate.isArchived && candidate.currencyCode === transfer.currencyCode);

    let availableAccountsTo = accounts.filter(candidate => candidate.id !== fromAccountId &&
        !candidate.isArchived && candidate.currencyCode === transfer.currencyCode);

    function handleFromAccountChange(newFromAccountId: string) {
        setFromAccountId(newFromAccountId);
        const newFromAccount = accounts.find(account => account.id === newFromAccountId);
        const currentToAccount = accounts.find(account => account.id === toAccountId);
        if (!newFromAccount || !currentToAccount ||
            newFromAccount.id === currentToAccount.id ||
            newFromAccount.currencyCode !== currentToAccount.currencyCode) {
            setToAccountId("");
        }
        else {
            availableAccountsTo = accounts.filter(candidate => candidate.id !== newFromAccount.id &&
                !candidate.isArchived && candidate.currencyCode === transfer.currencyCode);
        }
    }

    function handleToAccountChange(newToAccountId: string) {
        setToAccountId(newToAccountId);
        const newToAccount = accounts.find(account => account.id === newToAccountId);
        const currentFromAccount = accounts.find(account => account.id === fromAccountId);
        if (!newToAccount || !currentFromAccount ||
            newToAccount.id === currentFromAccount.id ||
            newToAccount.currencyCode !== currentFromAccount.currencyCode) {
            setToAccountId("");
        }
        else {
            availableAccountsFrom = accounts.filter(candidate => candidate.id !== newToAccount.id &&
                !candidate.isArchived && candidate.currencyCode === transfer.currencyCode);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError("Введите корректную сумму");
            return;
        }
        setIsSubmitting(true);
        try {
            await updateTransfer(transfer.transferGroupId, {
                fromAccountId,
                toAccountId,
                amount: parsedAmount,
                occurredAtUtc: new Date(occurredAt).toISOString(),
                note: note.trim() || null
            });
            await onUpdate();
            onCancel();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось обновить перевод");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
                <div className="card-body">
                    <div className="card-text">
                        <label htmlFor="transfer-from-account">Со счёта </label>
                        <select id="transfer-from-account" value={fromAccountId}
                            onChange={event => handleFromAccountChange(event.target.value)} required>
                            {availableAccountsFrom.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="card-text">
                        <label htmlFor="transfer-to-account">На счёт </label>
                        <select id="transfer-to-account" value={toAccountId}
                            onChange={event => setToAccountId(event.target.value)} required>
                            {availableAccountsTo.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="card-text">
                        <label htmlFor="transfer-amount">Сумма </label>
                        <input id="transfer-amount" type="number" min="0.01" step="0.01"
                            value={amount} onChange={event => setAmount(event.target.value)}
                            required /> {transfer.currencyCode}
                    </div>

                    <div className="card-text">
                        <label htmlFor="transfer-date">Дата </label>
                        <input id="transfer-date" type="datetime-local"
                            value={occurredAt} onChange={event => setOccurredAt(event.target.value)}
                            required />
                    </div>

                    <div className="card-text">
                        <label htmlFor="transfer-note">Комментарий </label>
                        <input id="transfer-note" value={note} onChange={event => setNote(event.target.value)} />
                    </div>

                    {error && <p>{error}</p>}

                    <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Обновляем..." : "Обновить"}</button>
                    <button className="card-btn" type="button" onClick={() => onCancel()}>Отмена</button>
                </div>
            </div>
        </form>
    );
}