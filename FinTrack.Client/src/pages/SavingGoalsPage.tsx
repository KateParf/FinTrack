import { getAccounts } from "../api/accountsApi";
import { useEffect, useState } from "react";
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
        <div>
            <h1>Ваши цели для накоплений</h1>

            <label htmlFor="archived">
                <input id="archived" type="checkbox"
                    checked={includeArchived} disabled={isLoading}
                    onChange={event => {
                        const checked = event.target.checked;
                        event.preventDefault();
                        setIncludeArchived(checked);
                        loadGoals();
                    }}
                />
                Показывать заархивированные
            </label>
            <div>
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