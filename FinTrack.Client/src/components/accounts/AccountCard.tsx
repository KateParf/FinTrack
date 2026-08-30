import { FormEvent, useState } from "react";
import { Account, accountTypeLabels, UpdateAccountRequest } from "../../types/account";
import { formatCurrency } from "../../utils/formatMoney";
import { UpdateAccountForm } from "./UpdateAccountForm";
import { Link } from "react-router-dom";

interface AccountCardProps {
    account: Account;
    onArchive: (id: string) => Promise<void>;
    onRestore: (id: string) => Promise<void>;
    onUpdate: (id: string, request: UpdateAccountRequest) => Promise<void>;
}

export function AccountCard({ account, onArchive, onRestore, onUpdate }: AccountCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <UpdateAccountForm account={account} onSave={onUpdate} onCancel={() => setIsEditing(false)} />
        );
    }

    return (
        <article className="card">
            <div className="card-title">
                <h3>{account.name}</h3>
                <button className="card-btn" onClick={() => setIsEditing(true)}>Редактировать</button>
            </div>
            <div className="card-body">
                <div className="card-text">Тип: {accountTypeLabels[account.type]}</div>
                <div>{formatCurrency(account.balance, account.currencyCode)}</div>
                {account.isArchived ?
                    (<div className="card-text">
                        Архивный
                        <button className="card-btn" onClick={() => onRestore(account.id)}>Восстановить</button>
                    </div>
                    ) :
                    <div className="card-text"><button className="card-btn" onClick={() => onArchive(account.id)}>Архивировать</button></div>
                }
                <Link className="card-btn" to={`/accounts/${account.id}/transactions`}>Посмотреть операции</Link>
            </div>
        </article>
    );
}