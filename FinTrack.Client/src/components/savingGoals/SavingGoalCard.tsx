import { FormEvent, useState } from "react";
import { Account, accountTypeLabels } from "../../types/account";
import { formatCurrency } from "../../utils/formatMoney";
import { SavingGoal, SavingGoalRequest } from "../../types/savingGoal";
import { formatDate, formatDateTime } from "../../utils/formatDateTime";
import { UpdateSavingGoalForm } from "./UpdateSavingGoal";
import { PiggyBankFill } from "react-bootstrap-icons";

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
            <article className="card col-12 ms-0 mb-3">
                <UpdateSavingGoalForm goal={goal} accounts={accounts} onSave={onUpdate} onCancel={() => setIsEditing(false)} />
            </article>
        );
    }

    return (
        <article className="card col-12 ms-0 mb-3">
            <div className="card-body">

                <div className="row align-items-center pb-3">
                    <div className="col-lg-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="goal-icon text-white rounded p-2">
                                <PiggyBankFill className="fs-1" />
                            </div>

                            <div>
                                <h4 className="card-title mb-1">{goal.name}</h4>
                                <div className="card-text small mb-1">Цель: {formatCurrency(goal.targetAmount, goal.currencyCode)}</div>
                                <div className="card-text small mb-1">На данный момент: {formatCurrency(goal.currentAmount, goal.currencyCode)}</div>
                                <div className="d-flex align-items-center gap-1 text-success fw-bold">
                                    <progress className="custom-progress" value={goal.progressPercent} max="100" />&nbsp;{goal.progressPercent}&nbsp;%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-1 d-flex">
                        <div className="d-flex flex-column gap-1">
                            <h5 className="card-text mb-0">Осталось</h5>
                            <h5 className="fw-bold">
                                {formatCurrency(goal.remainingAmount, goal.currencyCode)}
                            </h5>
                        </div>
                    </div>
                    {goal.targetDate &&
                        <div className="col-lg-2 d-flex">
                            <div className="d-flex flex-column gap-1">
                                <h5 className="card-text mb-0">Целевая дата</h5>
                                <h5 className="fw-bold">
                                {formatDate(goal.targetDate)}
                                </h5>
                            </div>
                        </div>
                    }
                    <div className="col-lg-1 d-flex">
                        <div className="d-flex flex-column gap-1">
                            <h5 className="card-text mb-0">Статус</h5>
                            <h5 className={`${goal.isArchived ? 'text-secondary' : 'text-success'} fw-bold`}>
                                {goal.isArchived ? 'Архивная' : 'Активная'}
                            </h5>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="d-flex gap-2 justify-content-end">
                            <button className="btn card-btn" onClick={() => setIsEditing(true)}>Редактировать</button>
                            {goal.isArchived ?
                                <button className="btn card-btn" onClick={() => onRestore(goal.id)}>Восстановить</button>
                                :
                                <button className="btn card-btn" onClick={() => onArchive(goal.id)}>Архивировать</button>
                            }
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-top small card-text">
                    <div>Создана: {formatDateTime(goal.creationTimeAtUtc)}</div>
                    <div>Последнее обновление: {formatDateTime(goal.updateTimeAtUtc)}</div>
                </div>
            </div>
        </article>
    );
}