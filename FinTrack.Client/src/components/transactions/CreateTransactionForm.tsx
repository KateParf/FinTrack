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
        <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
                <div className="card-text">
                    <label htmlFor="transaction-type">Тип </label>
                    <select id="transaction-type" value={type}
                        onChange={event => {
                            setType(Number(event.target.value) as TransactionType);
                            setCategoryId("");
                        }}>
                        <option value={TransactionType.Income}>Доход</option>
                        <option value={TransactionType.Expense}>Расход</option>
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="transaction-category">Категория </label>
                    <select id="transaction-category" value={categoryId}
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
                    <label htmlFor="transaction-amount">Сумма </label>
                    <input id="transaction-amount" type="number" min="0.01" step="0.01"
                        value={amount} onChange={event => setAmount(event.target.value)}
                        required /> {account.currencyCode}
                </div>

                <div className="card-text">
                    <label htmlFor="transaction-date">Дата </label>
                    <input id="transaction-date" type="datetime-local"
                        value={occurredAt} onChange={event => setOccurredAt(event.target.value)}
                        required />
                </div>

                <div className="card-text">
                    <label htmlFor="transaction-note">Комментарий </label>
                    <input id="transaction-note" value={note} onChange={event => setNote(event.target.value)}/>
                </div>

                {error && <p>{error}</p>}

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Добавить операцию"}</button>
            </div>
        </form>
    );
}