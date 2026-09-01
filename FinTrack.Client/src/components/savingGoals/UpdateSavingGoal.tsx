import { FormEvent, useState } from "react";
import { updateAccount } from "../../api/accountsApi";
import { Account, AccountOption, AccountType, accountTypeLabels, UpdateAccountRequest } from "../../types/account";
import { SavingGoal, SavingGoalRequest } from "../../types/savingGoal";
import { formatCurrency } from "../../utils/formatMoney";
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

    const currs = ["RUB", "USD", "EUR", "BYN", "KZT", "AMD", "KGS", "MDL", "TJS", "CNY"];
    const currencyOptions = currs.map((cur, idx) => { return <option key={idx} value={cur}>{cur}</option>; });

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
        <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
                <div className="card-text">
                    <label htmlFor="name">Название </label>
                    <input id="name" value={name}
                        onChange={event =>
                            setName(event.target.value)
                        }
                        required />
                </div>

                <div className="card-text">
                    <label htmlFor="targetAmount">Цель </label>
                    <input id="targetAmount" type="number" min="0" step="0.01" value={targetAmount}
                        onChange={event =>
                            setTargetAmount(event.target.value)
                        }
                        required />
                </div>

                <div className="card-text">
                    <label htmlFor="baseCurrency">Валюта </label>
                    <select id="currency" value={currencyCode}
                        onChange={event =>
                            handleCurrencyChange(event.target.value)
                        }
                        required>
                        {currencyOptions}
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="targetDate">Дата достижения </label>
                    <input id="targetDate" type="date" value={targetDate ?? ""}
                        onChange={event =>
                            setTargetDate(event.target.value)
                        }
                    />
                </div>

                <div className="card-text">
                    <label htmlFor="accountIds">Привяжите счета</label>
                    <Select<AccountOption, true>
                        inputId="accountIds" isMulti
                        options={availableAccounts}
                        value={selectedAccounts}
                        onChange={selectedOptions => {
                            setAccountIds(selectedOptions.map(option => option.value));
                        }}/>
                </div>

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Обновляем..." : "Обновить"}</button>
                <button className="card-btn" type="button" onClick={() => onCancel()}>Отмена</button>
            </div>
        </form>
    );
}
