import { FormEvent, useState } from "react";
import { updateTransaction } from "../../api/transactionsApi";
import { CategoryWithDepth } from "../../utils/flattenCategories";
import { Transaction, TransactionType } from "../../types/transaction";
import { CategoryType } from "../../types/category";

interface UpdateTransactionFormProps {
    transaction: Transaction;
    categories: CategoryWithDepth[];
    onUpdate: () => Promise<void>;
    onCancel: () => void;
}

function toDateTimeLocal(value: string): string {
    const date = new Date(value);
    const timezoneOffset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function UpdateTransactionForm({
    transaction,
    categories,
    onUpdate,
    onCancel
}: UpdateTransactionFormProps) {
    const [type, setType] = useState<TransactionType>(transaction.type);
    const [categoryId, setCategoryId] = useState(transaction.categoryId ?? "");
    const [amount, setAmount] = useState(transaction.amount.toString());
    const [occurredAt, setOccurredAt] = useState(toDateTimeLocal(transaction.occurredAtUtc));
    const [note, setNote] = useState(transaction.note ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableCategories = categories.filter(({ category }) => {
        if (category.isArchived) return false;
        if (type === TransactionType.Income) return category.type === CategoryType.Income;
        if (type === TransactionType.Expense) return category.type === CategoryType.Expense;
        return false;
    });

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
            await updateTransaction(transaction.id, {
                accountId: transaction.accountId,
                type,
                categoryId: categoryId || null,
                amount: parsedAmount,
                occurredAtUtc: new Date(occurredAt).toISOString(),
                note: note.trim() || null
            });
            await onUpdate();
            onCancel();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось обновить операцию");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
                <div className="card-text">
                    <label htmlFor="update-transaction-type">Тип </label>
                    <select id="update-transaction-type" value={type}
                        onChange={event => {
                            setType(Number(event.target.value) as TransactionType);
                            setCategoryId("");
                        }}>
                        <option value={TransactionType.Income}>Доход</option>
                        <option value={TransactionType.Expense}>Расход</option>
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="update-transaction-category">Категория </label>
                    <select id="update-transaction-category" value={categoryId}
                        onChange={event => setCategoryId(event.target.value)}>
                        <option value="">Без категории</option>
                        {availableCategories.map(({ category, depth }) => (
                            <option key={category.id} value={category.id}>
                                {"— ".repeat(depth)}{category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="update-transaction-amount">Сумма </label>
                    <input id="update-transaction-amount" type="number"
                        min="0.01" step="0.01" value={amount}
                        onChange={event => setAmount(event.target.value)}
                        required />
                </div>

                <div className="card-text">
                    <label htmlFor="update-transaction-date">Дата </label>
                    <input id="update-transaction-date"
                        type="datetime-local" value={occurredAt}
                        onChange={event => setOccurredAt(event.target.value)}
                        required />
                </div>

                <div className="card-text">
                    <label htmlFor="update-transaction-note">Комментарий </label>
                    <input id="update-transaction-note" value={note}
                        onChange={event => setNote(event.target.value)}
                    />
                </div>

                {error && <p>{error}</p>}

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Обновляем..." : "Обновить"}</button>
                <button className="card-btn" type="button" onClick={() => onCancel()}>Отмена</button>
            </div>
        </form>
    );
}