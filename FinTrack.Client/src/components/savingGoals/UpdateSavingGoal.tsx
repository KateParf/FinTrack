import { FormEvent, useState } from "react";
import { Account, AccountOption, AccountType, accountTypeLabels, UpdateAccountRequest } from "../../types/account";
import { SavingGoal, SavingGoalRequest } from "../../types/savingGoal";
import { currenciesLabelsLocales, formatCurrency } from "../../utils/formatMoney";
import Select from 'react-select';

interface UpdateSavingGoalFormProps {
    goal: SavingGoal;
    accounts: Account[];
    onSave: (id: string, request: SavingGoalRequest) => Promise<void>;
    onCancel: () => void;
}

export function UpdateSavingGoalForm({ goal, accounts, onSave, onCancel }: UpdateSavingGoalFormProps) {
    const [name, setName] = useState(goal.name);
    const [currencyCode, setCurrencyCode] = useState(goal.currencyCode);
    const [targetAmount, setTargetAmount] = useState<string>(goal.targetAmount.toString());
    const [targetDate, setTargetDate] = useState<string | null>(goal.targetDate);
    const [accountIds, setAccountIds] = useState<string[]>(goal.accounts.map(acc => acc.id));
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
            await onSave(goal.id, {
                name,
                targetAmount: amount,
                currencyCode,
                targetDate,
                accountIds
            });
            onCancel();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось обновить цель");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="card-body" onSubmit={handleSubmit}>
            <div className="row align-items-end g-3">

                <div className="col-lg-4">
                    <label htmlFor="name" className="form-label">Название</label>
                    <input id="name" value={name} className="form-control"
                        onChange={event =>
                            setName(event.target.value)
                        }
                        required />
                </div>

                <div className="col-lg-auto">
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

                <div className="col-lg-2">
                    <label htmlFor="accountIds" className="form-label">Привяжите счета</label>
                    <Select<AccountOption, true> placeholder="Ваши накопительные счета"
                        inputId="accountIds" isMulti classNamePrefix="my-select" 
                        options={availableAccounts} value={selectedAccounts}
                        onChange={selectedOptions => {
                            setAccountIds(selectedOptions.map(option => option.value));
                        }} />
                </div>

                <div className="col">
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
