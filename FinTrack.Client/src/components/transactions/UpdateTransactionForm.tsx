import { FormEvent, useState } from "react";
import { updateTransaction } from "../../api/transactionsApi";
import { CategoryWithDepth } from "../../utils/flattenCategories";
import { Transaction, TransactionType } from "../../types/transaction";
import { CategoryType } from "../../types/category";
import { toDateTimeLocal } from "../../utils/formatDateTime";

interface UpdateTransactionFormProps {
    transaction: Transaction;
    categories: CategoryWithDepth[];
    onUpdate: () => Promise<void>;
    onCancel: () => void;
}

export function UpdateTransactionForm({ transaction, categories, onUpdate, onCancel }: UpdateTransactionFormProps) {
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
        <form className="card-body" onSubmit={handleSubmit}>
            <div className="row align-items-end">
                <div className="col">
                    <label htmlFor="transaction-type" className="form-label">Тип </label>
                    <select id="transaction-type" value={type} className="form-select"
                        onChange={event => {
                            setType(Number(event.target.value) as TransactionType);
                            setCategoryId("");
                        }}>
                        <option value={TransactionType.Income}>Доход</option>
                        <option value={TransactionType.Expense}>Расход</option>
                    </select>
                </div>

                <div className="col">
                    <label htmlFor="transaction-category" className="form-label">Категория</label>
                    <select id="transaction-category" value={categoryId} className="form-select"
                        onChange={event => setCategoryId(event.target.value)}>
                        <option value="">Без категории</option>
                        {availableCategories.map(({ category, depth }) => (
                            <option key={category.id} value={category.id}>
                                {"— ".repeat(depth)}{category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col">
                    <label htmlFor="transaction-amount" className="form-label">Сумма</label>
                    <input id="transaction-amount" type="number" className="form-control"
                        min="0.01" step="0.01" value={amount}
                        onChange={event => setAmount(event.target.value)}
                        required />
                </div>

                <div className="col-lg-auto">
                    <label htmlFor="transaction-date" className="form-label">Дата</label>
                    <input id="transaction-date" className="form-control"
                        type="datetime-local" value={occurredAt}
                        onChange={event => setOccurredAt(event.target.value)}
                        required />
                </div>

                <div className="col-lg-4">
                    <label htmlFor="transaction-note" className="form-label">Комментарий</label>
                    <input id="transaction-note" value={note} className="form-control"
                        onChange={event => setNote(event.target.value)}
                    />
                </div>

                <div className="col-lg-auto">
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
            {error && <p className="alert alert-danger mt-4">{error}</p>}
        </form>
    );
}