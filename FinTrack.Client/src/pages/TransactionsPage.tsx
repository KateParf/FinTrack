import { FormEvent, useEffect, useState } from "react";
import { Transaction, TransactionType, transactionTypeLabels } from "../types/transaction";
import { Account } from "../types/account";
import { deleteTransaction, getTransactions } from "../api/transactionsApi";
import { getAccountById, getAccounts } from "../api/accountsApi";
import { Link, useParams } from "react-router-dom";
import { TransactionCard } from "../components/transactions/TransactionCard";
import { getCategories } from "../api/categoriesApi";
import { CategoryWithDepth, flattenCategoriesWithDepth } from "../utils/flattenCategories";
import { toEndOfDayUtc, toStartOfDayUtc } from "../utils/formatDateTime";
import { formatCurrency } from "../utils/formatMoney";
import { CategoryType } from "../types/category";
import { CreateTransactionForm } from "../components/transactions/CreateTransactionForm";
import { CreateTransferForm } from "../components/transfers/CreateTransferForm";
import { deleteTransfer } from "../api/transfersApi";

export function TransactionsPage() {
    const { accountId } = useParams<{ accountId: string }>();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [account, setAccount] = useState<Account | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
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
            const [accountResponse, accountsResponse, transactionsResponse, categoriesResponse] = await Promise.all([
                getAccountById(accountId),
                getAccounts(null, false),
                getTransactions(accountId),
                getCategories(null, true)
            ]);
            setAccount(accountResponse);
            setAccounts(accountsResponse);
            setTransactions(transactionsResponse);
            setCategories(flattenCategoriesWithDepth(categoriesResponse));
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось загрузить операции");
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { void loadPageData(); }, [accountId]);

    async function loadTransactions(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
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

    async function handleDeleteTransaction(id: string) {
        const confirmed = window.confirm("Удалить операцию?");
        if (!confirmed) return;
        try {
            await deleteTransaction(id);
            await loadPageData();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось удалить операцию");
        }
    }

    async function handleDeleteTransfer(transferGroupId: string) {
        const confirmed = window.confirm("Удалить перевод?");
        if (!confirmed) return;
        try {
            await deleteTransfer(transferGroupId);
            await loadPageData();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось удалить перевод");
            throw error;
        }
    }

    if (!accountId) { return <p>Не указан счёт</p>; }
    return (
        <div className="container">
            <h1>Операции на счёте {account?.name}</h1>
            {account && (<h2>Баланс: {formatCurrency(account.balance, account.currencyCode)}</h2>)}

            <form onSubmit={loadTransactions}>
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

                <button className="card-btn" type="submit" disabled={isLoading}>
                    {isLoading ? "Загружаем..." : "Применить"}
                </button>
            </form>

            <div>
                {isLoading && (<p>Загружаем операции...</p>)}
                {!isLoading && error && (<p>{error}</p>)}
                {!isLoading && !error && transactions.length === 0 && (<p>На этом счету пока нет операций</p>)}

                {!isLoading && !error &&
                    transactions.map(transaction => (
                        <TransactionCard key={transaction.id} 
                        transaction={transaction} accounts = {accounts} currencyCode={account!.currencyCode} categories={categories} 
                        onUpdate={loadPageData} onDeleteTransaction={handleDeleteTransaction} onDeleteTransfer={handleDeleteTransfer}/>
                    ))}

                {!isLoading && !error && account &&
                    (<div>
                        <h2>Добавить новую операцию</h2>
                        <CreateTransactionForm account={account} categories={categories} onCreate={loadPageData} />
                    </div>)}
                {!isLoading && !error && account &&
                    (<div>
                        <h2>Добавить новый перевод между счетами</h2>
                        <CreateTransferForm account={account} accounts={accounts} onCreate={loadPageData} />
                    </div>)
                }
            </div>

            <div><Link className="card-btn" to="/accounts"> ← К счетам </Link></div>
        </div >
    );
}