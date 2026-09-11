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
    const [isCreating, setIsCreating] = useState(false);

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
        <div className="m-4">
            <div className="row d-flex justify-content-between">
                <h2 className="col-auto"> Ваши счета </h2>
                {!isCreating && <button className="col-auto btn"
                    onClick={event =>
                        setIsCreating(true)
                    }> +&nbsp;Новый счёт</button>}
                {isCreating && <button className="col-auto btn card-btn"
                    onClick={event =>
                        setIsCreating(false)
                    }> Назад к счетам</button>}
            </div>

            <form className="row d-flex justify-content-start align-items-end pb-3 border-bottom"
                onSubmit={handleSubmit}>
                <div className="col-auto">
                    <label className="form-label m-0" htmlFor="type">Тип счета</label>
                    <select className="form-select" id="type" value={type ?? ""}
                        onChange={event => {
                            const value = event.target.value;
                            setType(value === "" ? null : Number(value) as AccountType)
                        }
                        }>
                        <option value="">Все типы</option>
                        {typeOptions}
                    </select>
                </div>

                <div className="col-auto form-check form-switch mb-2">
                    <label className="form-check-label" htmlFor="archived">
                        <input className="form-check-input me-2" id="archived" type="checkbox" role="switch" checked={includeArchived}
                            onChange={event =>
                                setIncludeArchived(event.target.checked)
                            }
                        />
                        Показывать заархивированные
                    </label>
                </div>

                <button className="col-auto btn card-btn" type="submit" disabled={isLoading || isCreating}>
                    {isLoading ? "Загружаем..." : "Применить"}
                </button>
            </form>

            {!isCreating && <div className="pt-3" style={{
                height: '75vh',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {isLoading && (<p className="py-4 text-secondary">Загружаем счета...</p>)}
                {!isLoading && error && (<p className="alert alert-danger mt-4">{error}</p>)}
                {!isLoading && !error && accounts.length === 0 && (
                    <p className="py-5 text-center text-secondary">У вас пока нет счетов</p>
                )}

                {!isLoading && !error &&
                    accounts.map(account => (
                        <AccountCard key={account.id} account={account}
                            onArchive={handleArchive} onRestore={handleRestore} onUpdate={handleUpdate} />
                    ))
                }
            </div>}

            {isCreating && <div className="pt-3">
                <h2>Добавить новый счёт</h2>
                <CreateAccountForm onCreate={loadAccounts} />
            </div>}
        </div>
    );
}