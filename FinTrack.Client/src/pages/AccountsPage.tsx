import { archiveAccount, getAccounts, restoreAccount, updateAccount } from "../api/accountsApi";
import { FormEvent, useEffect, useState } from "react";
import { Account, AccountType, accountTypeLabels, UpdateAccountRequest } from "../types/account";
import { AccountCard } from "../components/accounts/AccountCard";
import { CreateAccountForm } from "../components/accounts/CreateAccountForm";

export function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<number | null>(null);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const typeOptions = Object.entries(accountTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>{label}</option>
    ));


    async function loadAccounts() {
        setError(null);
        setIsLoading(true);
        try {
            const response = await getAccounts(type, includeArchived);
            setAccounts(response);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Ошибка при загрузке счетов");
            setAccounts([]);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { void loadAccounts(); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await loadAccounts();
    }

    async function handleArchive(id: string) {
        try {
            await archiveAccount(id);
            await loadAccounts();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось архивировать счёт");
        }
    }

    async function handleRestore(id: string) {
        try {
            await restoreAccount(id);
            await loadAccounts();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось восстановить счёт");
        }
    }

    async function handleUpdate(id: string, request: UpdateAccountRequest) {
        await updateAccount(id, request);
        await loadAccounts();
    }

    return (
        <div>
            <h1>Ваши счета</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="type">Тип </label>
                    <select id="type" value={type ?? ""}
                        onChange={event => {
                            const value = event.target.value;
                            setType(value === "" ? null : Number(value) as AccountType)
                        }
                        }>
                        <option value="">Все типы</option>
                        {typeOptions}
                    </select>
                </div>

                <div>
                    <label htmlFor="archived">
                        <input id="archived" type="checkbox" checked={includeArchived}
                            onChange={event =>
                                setIncludeArchived(event.target.checked)
                            }
                        />
                        Показывать заархивированные
                    </label>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Загружаем..." : "Применить"}
                </button>
            </form>

            <div>
                {isLoading && (<p>Загружаем счета...</p>)}
                {!isLoading && error && (<p>{error}</p>)}
                {!isLoading && !error && accounts.length === 0 && (<p>У вас пока нет счетов</p>)}

                {!isLoading && !error &&
                    accounts.map(account => (
                        <AccountCard key={account.id} account={account} 
                        onArchive={handleArchive} onRestore={handleRestore} onUpdate={handleUpdate}/>
                    ))}
            </div>

            <div>
                <h2>Добавить новый счёт</h2>
                <CreateAccountForm onCreate={loadAccounts} />
            </div>
        </div>
    );
}