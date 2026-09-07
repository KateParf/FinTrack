import { getAccounts } from "../api/accountsApi";
import { FormEvent, useEffect, useState } from "react";
import { Account } from "../types/account";
import { SavingGoal, SavingGoalRequest } from "../types/savingGoal";
import { archiveSavingGoal, getSavingGoals, restoreSavingGoal, updateSavingGoal } from "../api/savingGoalsApi";
import { SavingGoalCard } from "../components/savingGoals/SavingGoalCard";
import { CreateSavingGoalForm } from "../components/savingGoals/CreateSavingGoal";

export function SavingGoalsPage() {
    const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    async function loadGoals() {
        setError(null);
        setIsLoading(true);
        try {
            const [goalsResponse, accountsResponse] = await Promise.all([
                getSavingGoals(includeArchived),
                getAccounts(null, false)
            ]);
            setSavingGoals(goalsResponse);
            setAccounts(accountsResponse);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Ошибка при загрузке целей");
            setSavingGoals([]);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { void loadGoals(); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await loadGoals();
    }

    async function handleArchive(id: string) {
        try {
            await archiveSavingGoal(id);
            await loadGoals();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось архивировать цель");
        }
    }

    async function handleRestore(id: string) {
        try {
            await restoreSavingGoal(id);
            await loadGoals();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось восстановить цель");
        }
    }

    async function handleUpdate(id: string, request: SavingGoalRequest) {
        await updateSavingGoal(id, request);
        await loadGoals();
    }

    return (
        <div className="m-4 border-start ps-4">
            <div className="row d-flex justify-content-between">
                <div className="col-auto h2"> Ваши цели для накоплений </div>
                <button className="col-auto btn"> +&nbsp;Новая цель</button>
            </div>

            <form className="row d-flex justify-content-start align-items-end pb-3 border-bottom ps-2"
                onSubmit={handleSubmit}>
                <div className="col-auto form-check form-switch mb-2">
                    <label className="form-check-label" htmlFor="archived">
                        <input className="form-check-input me-2" id="archived" type="checkbox" role="switch"
                            checked={includeArchived} disabled={isLoading}
                            onChange={event => {
                                setIncludeArchived(event.target.checked);
                            }}
                        />
                        Показывать заархивированные
                    </label>
                </div>
                <button className="col-auto btn card-btn" type="submit" disabled={isLoading}>
                    {isLoading ? "Загружаем..." : "Применить"}
                </button>
            </form>

            <div className="pt-3">
                {isLoading && (<p>Загружаем цели...</p>)}
                {!isLoading && error && (<p>{error}</p>)}
                {!isLoading && !error && savingGoals.length === 0 && (<p>У вас пока нет целей</p>)}

                {!isLoading && !error &&
                    savingGoals.map(goal => (
                        <SavingGoalCard key={goal.id} goal={goal} accounts={accounts}
                            onArchive={handleArchive} onRestore={handleRestore} onUpdate={handleUpdate} />
                    ))}
            </div>

            <div>
                <h2>Добавить новую цель</h2>
                <CreateSavingGoalForm accounts={accounts} onCreate={loadGoals} />
            </div>
        </div>
    );
}