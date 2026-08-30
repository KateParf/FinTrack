import { FormEvent, useEffect, useState } from "react";
import { Transaction, TransactionType, transactionTypeLabels } from "../types/transaction";
import { Account } from "../types/account";
import { getTransactions } from "../api/transactionsApi";
import { getAccountById } from "../api/accountsApi";
import { Link, useParams } from "react-router-dom";
import { TransactionCard } from "../components/transactions/TransactionCard";
import { getCategories } from "../api/categoriesApi";
import { CategoryWithDepth, flattenCategoriesWithDepth } from "../utils/flattenCategories";
import { toEndOfDayUtc, toStartOfDayUtc } from "../utils/formatDateTime";
import { formatCurrency } from "../utils/formatMoney";
import { CategoryType } from "../types/category";
import { CreateTransactionForm } from "../components/transactions/CreateTransactionForm";

export function TransactionsPage() {
    const { accountId } = useParams<{ accountId: string }>();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [account, setAccount] = useState<Account | null>(null);
    const [categories, setCategories] = useState<CategoryWithDepth[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [type, setType] = useState<TransactionType | null>(null);
    const [categoryId, setCategoryId] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const typeOptions = Object.entries(transactionTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>{label}</option>
    ));
    const availableCategories = categories.filter(({ category }) => {
        if (type === null) return true;
        if (type === TransactionType.Income) return category.type === CategoryType.Income;
        if (type === TransactionType.Expense) return category.type === CategoryType.Expense;
        return false;
    });
    const isTransfer = type === TransactionType.TransferIn || type === TransactionType.TransferOut;

    async function loadPageData() {
        if (!accountId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [accountResponse, transactionsResponse, categoriesResponse] = await Promise.all([
                getAccountById(accountId),
                getTransactions(accountId),
                getCategories(null, true)
            ]);
            setAccount(accountResponse);
            setTransactions(transactionsResponse);
            setCategories(flattenCategoriesWithDepth(categoriesResponse));
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось загрузить операции");
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { void loadPageData(); }, [accountId]);

    async function loadTransactions() {
        if (!accountId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await getTransactions(accountId, {
                type,
                categoryId: categoryId || null,
                from: toStartOfDayUtc(from),
                to: toEndOfDayUtc(to)
            });
            setTransactions(response);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось загрузить операции");
        } finally {
            setIsLoading(false);
        }
    }
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await loadTransactions();
    }

    if (!accountId) { return <p>Не указан счёт</p>; }
    return (
        <div className="container">
            <h1>Операции на счёте {account?.name}</h1>
            {account && (<h2>Баланс: {formatCurrency(account.balance, account.currencyCode)}</h2>)}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="type">Тип </label>
                    <select id="type" value={type ?? ""}
                        onChange={event => {
                            const value = event.target.value;
                            setType(value === "" ? null : Number(value) as TransactionType);
                            setCategoryId("");
                        }
                        }>
                        <option value="">Все типы</option>
                        {typeOptions}
                    </select>
                </div>

                <div>
                    <label htmlFor="category">Категория </label>
                    <select id="category" value={categoryId ?? ""} disabled={isTransfer}
                        onChange={event => {
                            const value = event.target.value;
                            setCategoryId(value)
                        }
                        }>
                        <option value="">Все категории</option>
                        {availableCategories.map(({ category, depth }) => (
                            <option key={category.id} value={category.id}>
                                {"— ".repeat(depth)}{category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="date-picker-from">C:</label>
                    <input id="date-picker-from" type="date"
                        value={from}
                        onChange={event => {
                            setFrom(event.target.value)
                        }}
                    />

                    <label htmlFor="date-picker-to">По:</label>
                    <input id="date-picker-to" type="date"
                        value={to}
                        onChange={event => {
                            setTo(event.target.value)
                        }}
                    />
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Загружаем..." : "Применить"}
                </button>
            </form>

            <div>
                {isLoading && (<p>Загружаем операции...</p>)}
                {!isLoading && error && (<p>{error}</p>)}
                {!isLoading && !error && transactions.length === 0 && (<p>На этом счету пока нет операций</p>)}

                {!isLoading && !error && account &&
                    transactions.map(transaction => (
                        <TransactionCard key={transaction.id} transaction={transaction} currencyCode={account.currencyCode} categories={categories} onUpdate={loadTransactions}/>
                    ))}
            </div>

            <div>
                <h2>Добавить новую операцию</h2>
                <CreateTransactionForm accountId={accountId} categories={categories} onCreate={loadTransactions} />
            </div>

            <div><Link to="/accounts"> ← К счетам </Link></div>
        </div>
    );
}