import { FormEvent, useState } from "react";
import Select from 'react-select';
import { Account, AccountOption, AccountType } from "../../types/account";
import { createSavingGoal } from "../../api/savingGoalsApi";
import { currenciesLabelsLocales, formatCurrency } from "../../utils/formatMoney";

interface CreateSavingGoalFormProps {
    accounts: Account[];
    onCreate: () => Promise<void>;
}

export function CreateSavingGoalForm({ accounts, onCreate }: CreateSavingGoalFormProps) {
    const [name, setName] = useState<string>("");
    const [currencyCode, setCurrencyCode] = useState("RUB");
    const [targetAmount, setTargetAmount] = useState<string>("0");
    const [targetDate, setTargetDate] = useState<string>("");
    const [accountIds, setAccountIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    let availableAccounts: AccountOption[] = accounts
        .filter(account => !account.isArchived &&
            (account.type === AccountType.Savings || account.type === AccountType.Deposit)
        ).map(account => ({
            value: account.id,
            label: `${account.name} ${formatCurrency(account.balance, account.currencyCode)}`
        }));

    const selectedAccounts = availableAccounts.filter(option => accountIds.includes(option.value));

    const currencyOptions = Object.entries(currenciesLabelsLocales).map(
        ([cur, loc], idx) => { return <option key={idx} value={cur}>{cur}</option>; });

    function handleCurrencyChange(newCurrencyCode: string) {
        setCurrencyCode(newCurrencyCode);
        availableAccounts = accounts.filter(account => !account.isArchived &&
            (account.type === AccountType.Savings || account.type === AccountType.Deposit) &&
            (account.currencyCode === newCurrencyCode)
        ).map(account => ({
            value: account.id,
            label: `${account.name} ${formatCurrency(account.balance, account.currencyCode)}`
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        const amount = Number(targetAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Введите корректную денежную цель");
            return;
        }
        setIsSubmitting(true);
        try {
            await createSavingGoal({
                name,
                targetAmount: amount,
                currencyCode,
                targetDate,
                accountIds
            });
            await onCreate();
            setName("");
            setTargetAmount("");
            setCurrencyCode("RUB");
            setTargetDate("");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось создать счёт");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <article className="card col-12 ms-0 mb-3">
            <form className="card-body" onSubmit={handleSubmit}>
                <div className="row align-items-end">

                    <div className="col-lg-3">
                        <label htmlFor="name" className="form-label">Название </label>
                        <input id="name" value={name} className="form-control"
                            onChange={event =>
                                setName(event.target.value)
                            }
                            required />
                    </div>

                    <div className="col">
                        <label htmlFor="targetAmount" className="form-label">Цель</label>
                        <input id="targetAmount" className="form-control" type="number" min="0" step="0.01" value={targetAmount}
                            onChange={event =>
                                setTargetAmount(event.target.value)
                            }
                            required />
                    </div>

                    <div className="col-lg-1">
                        <label htmlFor="baseCurrency" className="form-label">Валюта</label>
                        <select id="currency" value={currencyCode} className="form-select"
                            onChange={event =>
                                handleCurrencyChange(event.target.value)
                            }
                            required>
                            {currencyOptions}
                        </select>
                    </div>

                    <div className="col-lg-auto">
                        <label htmlFor="targetDate" className="form-label">Дата достижения</label>
                        <input id="targetDate" className="form-control" type="date" value={targetDate ?? ""}
                            onChange={event =>
                                setTargetDate(event.target.value)
                            }
                        />
                    </div>

                    <div className="col-lg-3">
                        <label htmlFor="accountIds" className="form-label">Привяжите счета</label>
                        <Select<AccountOption, true> placeholder="Ваши накопительные счета"
                            inputId="accountIds" isMulti classNamePrefix="my-select"
                            options={availableAccounts} value={selectedAccounts}
                            onChange={selectedOptions => {
                                setAccountIds(selectedOptions.map(option => option.value));
                            }} />
                    </div>

                    <div className="col-lg-auto d-flex justify-content-end">
                        <button className="btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Создать"}</button>
                    </div>
                </div>
                {error && <p className="alert alert-danger mt-4">{error}</p>}
            </form>
        </article>
    );
}
