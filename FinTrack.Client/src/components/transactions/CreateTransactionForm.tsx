import { FormEvent, useState } from "react";
import { createTransaction } from "../../api/transactionsApi";
import { CategoryWithDepth } from "../../utils/flattenCategories";
import { TransactionType } from "../../types/transaction";
import { CategoryType } from "../../types/category";
import { Account } from "../../types/account";

interface CreateTransactionFormProps {
    account: Account;
    categories: CategoryWithDepth[];
    onCreate: () => Promise<void>;
}

export function CreateTransactionForm({ account, categories, onCreate }: CreateTransactionFormProps) {
    const [type, setType] = useState<TransactionType>(TransactionType.Expense);
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [occurredAt, setOccurredAt] = useState("");
    const [note, setNote] = useState("");
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
        if (!occurredAt) {
            setError("Укажите дату операции");
            return;
        }
        setIsSubmitting(true);
        try {
            await createTransaction({
                accountId: account.id,
                type,
                categoryId: categoryId || null,
                amount: parsedAmount,
                occurredAtUtc: new Date(occurredAt).toISOString(),
                note: note.trim() || null
            });
            await onCreate();
            setCategoryId("");
            setAmount("");
            setOccurredAt("");
            setNote("");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось создать операцию");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <article className="card col-12 ms-0 mb-3">
            <form className="card-body" onSubmit={handleSubmit}>
                <div className="row align-items-end">

                    <div className="col">
                        <label htmlFor="transaction-type" className="form-label">Тип</label>
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

                    <div className="col-lg-2">
                        <label htmlFor="transaction-amount" className="form-label">Сумма ({account.currencyCode})</label>
                        <input id="transaction-amount" type="number" min="0.01" step="0.01" className="form-control"
                            value={amount} onChange={event => setAmount(event.target.value)}
                            required /> 
                    </div>

                    <div className="col">
                        <label htmlFor="transaction-date" className="form-label">Дата</label>
                        <input id="transaction-date" type="datetime-local" className="form-control"
                            value={occurredAt} onChange={event => setOccurredAt(event.target.value)}
                            required />
                    </div>

                    <div className="col-lg-4">
                        <label htmlFor="transaction-note" className="form-label">Комментарий</label>
                        <input id="transaction-note" value={note} className="form-control" 
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