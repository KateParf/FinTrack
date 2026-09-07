import { FormEvent, useState } from "react";
import { Account, AccountType, accountTypeLabels, UpdateAccountRequest } from "../../types/account";
import { formatCurrency } from "../../utils/formatMoney";
import { UpdateAccountForm } from "./UpdateAccountForm";
import { Link } from "react-router-dom";
import { formatDateTime } from "../../utils/formatDateTime";
import { CashCoin, CashStack, CreditCard, PiggyBank, Wallet2 } from "react-bootstrap-icons";

interface AccountCardProps {
    account: Account;
    onArchive: (id: string) => Promise<void>;
    onRestore: (id: string) => Promise<void>;
    onUpdate: (id: string, request: UpdateAccountRequest) => Promise<void>;
}

export function AccountCard({ account, onArchive, onRestore, onUpdate }: AccountCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    const renderAccountTypeIcon = (value: AccountType) => {
        switch (value) {
            case AccountType.Cash:
                return <CashCoin className="fs-4" />;
            case AccountType.DebitCard:
                return <CreditCard className="fs-4" />;
            case AccountType.Deposit:
                return <CashStack className="fs-4" />;
            case AccountType.Savings:
                return <PiggyBank className="fs-4" />;
            case AccountType.Other:
                return <Wallet2 className="fs-4" />;
            default:
                return <Wallet2 className="fs-4" />;
        }
    };

    if (isEditing) {
        return (
            <article className="card col-12 ms-0 mb-3">
                <UpdateAccountForm account={account} onSave={onUpdate} onCancel={() => setIsEditing(false)} />
            </article>
        );
    }

    return (
        <article className="card col-12 ms-0 mb-3">
            <div className="card-body">

                <div className="row align-items-center pb-3">
                    <div className="col-lg-6">
                        <div className="d-flex align-items-center gap-3">
                            <div className="account-icon text-white rounded p-2">
                                {renderAccountTypeIcon(account.type)}
                            </div>

                            <div>
                                <h4 className="card-title mb-1">{accountTypeLabels[account.type]}: {account.name}</h4>
                                <div className="card-text small">{account.currencyCode}</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-1 d-flex">
                        <div className="d-flex flex-column gap-1 pt-2">
                            <h5 className="card-text mb-0">Баланс</h5>
                            <h5 className="fw-bold">
                                {formatCurrency(account.balance, account.currencyCode)}
                            </h5>
                        </div>
                    </div>
                    <div className="col-lg-1 d-flex">
                        <div className="d-flex flex-column gap-1 pt-2">
                            <h5 className="card-text mb-0">Статус</h5>
                            <h5 className={`${account.isArchived ? 'text-secondary' : 'text-success'} fw-bold`}>
                                {account.isArchived ? 'Архивный' : 'Активный'}
                            </h5>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="d-flex gap-2 justify-content-end">
                            <button className="btn card-btn" onClick={() => setIsEditing(true)}>Редактировать</button>

                            {account.isArchived ?
                                <button className="btn card-btn" onClick={() => onRestore(account.id)}>Восстановить</button>
                                :
                                <button className="btn card-btn" onClick={() => onArchive(account.id)}>Архивировать</button>
                            }
                            <Link className="btn" to={`/accounts/${account.id}/transactions`}>Посмотреть операции</Link>
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-top small card-text">
                    <div>Создан: {formatDateTime(account.creationTimeAtUtc)}</div>
                    <div>Последнее обновление: {formatDateTime(account.updateTimeAtUtc)}</div>
                </div>
            </div>
        </article>
    );
}