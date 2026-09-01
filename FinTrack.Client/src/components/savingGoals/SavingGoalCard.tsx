import { FormEvent, useState } from "react";
import { Account, accountTypeLabels } from "../../types/account";
import { formatCurrency } from "../../utils/formatMoney";
import { Link } from "react-router-dom";
import { SavingGoal, SavingGoalRequest } from "../../types/savingGoal";
import { formatDateTime } from "../../utils/formatDateTime";
import { UpdateSavingGoalForm } from "./UpdateSavingGoal";

interface SavingGoalCardProps {
    goal: SavingGoal;
    accounts: Account[];
    onArchive: (id: string) => Promise<void>;
    onRestore: (id: string) => Promise<void>;
    onUpdate: (id: string, request: SavingGoalRequest) => Promise<void>;
}

export function SavingGoalCard({ goal, accounts, onArchive, onRestore, onUpdate }: SavingGoalCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <UpdateSavingGoalForm goal={goal} accounts={accounts} onSave={onUpdate} onCancel={() => setIsEditing(false)} />
        );
    }

    return (
        <article className="card">
            <div className="card-title">
                <h3>{goal.name}</h3>
                <button className="card-btn" onClick={() => setIsEditing(true)}>Редактировать</button>
            </div>
            <div className="card-body">
                <div className="card-text">Цель: {formatCurrency(goal.targetAmount, goal.currencyCode)}</div>
                <div className="card-text">На данный момент: {formatCurrency(goal.currentAmount, goal.currencyCode)}</div>
                <div className="card-text">Осталось: {formatCurrency(goal.remainingAmount, goal.currencyCode)}</div>
                <progress className="card-text" value={goal.progressPercent} max="100" style={{ width: '100%' }} />
                <div className="card-text">Создана: {formatDateTime(goal.creationTimeAtUtc)}</div>
                <div className="card-text">Последнее обновление: {formatDateTime(goal.updateTimeAtUtc)}</div>
                {goal.isArchived ?
                    (<div className="card-text">
                        Архивная
                        <button className="card-btn" onClick={() => onRestore(goal.id)}>Восстановить</button>
                    </div>
                    ) :
                    <div className="card-text"><button className="card-btn" onClick={() => onArchive(goal.id)}>Архивировать</button></div>
                }
            </div>
        </article>
    );
}