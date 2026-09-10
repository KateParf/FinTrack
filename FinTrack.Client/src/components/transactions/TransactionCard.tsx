import { useState } from "react";
import { Transaction, TransactionType, transactionTypeLabels } from "../../types/transaction";
import { CategoryWithDepth } from "../../utils/flattenCategories";
import { formatDateTime } from "../../utils/formatDateTime";
import { formatCurrency, getTransactionSign } from "../../utils/formatMoney";
import { UpdateTransactionForm } from "./UpdateTransactionForm";
import { UpdateTransferForm } from "../transfers/UpdateTransferForm";
import { Transfer } from "../../types/transfer";
import { Account } from "../../types/account";
import { getTransferByGroupId } from "../../api/transfersApi";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "react-bootstrap-icons";

interface TransactionCardProps {
    transaction: Transaction;
    accounts: Account[];
    currencyCode: string;
    categories: CategoryWithDepth[];
    onUpdate: () => Promise<void>;
    onDeleteTransaction: (id: string) => Promise<void>;
    onDeleteTransfer: (transferGroupId: string) => Promise<void>;
}

export function TransactionCard({ transaction, accounts, currencyCode, categories,
    onUpdate, onDeleteTransaction, onDeleteTransfer }: TransactionCardProps) {
    const [isEditingTransaction, setIsEditingTransaction] = useState(false);
    const [transfer, setTransfer] = useState<Transfer | null>(null);
    const [isEditingTransfer, setIsEditingTransfer] = useState(false);
    const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isTransaction = transaction.type === TransactionType.Income || transaction.type === TransactionType.Expense;
    const isTransfer = transaction.type === TransactionType.TransferIn || transaction.type === TransactionType.TransferOut;

    const renderTransactionTypeIcon = (value: TransactionType) => {
        switch (value) {
            case TransactionType.Income:
                return <ArrowDown className="fs-4" />;
            case TransactionType.Expense:
                return <ArrowUp className="fs-4" />;
            case TransactionType.TransferIn:
                return <ArrowRight className="fs-4" />;
            case TransactionType.TransferOut:
                return <ArrowLeft className="fs-4" />;
        }
    };

    async function handleDeleteTransactionClick() {
        setIsDeleting(true);
        try {
            await onDeleteTransaction(transaction.id);
        }
        finally {
            setIsDeleting(false);
        }
    }

    async function handleEditTransfer() {
        if (!transaction.transferGroupId) return;
        setIsLoadingTransfer(true);
        try {
            const response = await getTransferByGroupId(transaction.transferGroupId);
            setTransfer(response);
            setIsEditingTransfer(true);
        } finally {
            setIsLoadingTransfer(false);
        }
    }

    async function handleDeleteTransferClick() {
        setIsDeleting(true);
        try {
            await onDeleteTransfer(transaction.id);
        }
        finally {
            setIsDeleting(false);
        }
    }

    if (isEditingTransaction) {
        return (
            <article className="card col-12 ms-0 mb-3">
                <UpdateTransactionForm transaction={transaction} categories={categories} onUpdate={onUpdate} onCancel={() => setIsEditingTransaction(false)} />
            </article>
        );
    }
    if (isEditingTransfer && transfer) {
        return (
            <article className="card col-12 ms-0 mb-3">
                <UpdateTransferForm transfer={transfer} accounts={accounts} onUpdate={onUpdate} onCancel={() => setIsEditingTransfer(false)} />
            </article>
        );
    }
    return (
        <article className="card col-12 ms-0 mb-3">
            <div className="card-body">

                <div className="row align-items-center pb-3">
                    <div className="col-lg-1">
                        <div className="border-end card-text">{formatDateTime(transaction.occurredAtUtc)}</div>
                    </div>
                    <div className="col-lg-5">
                        <div className="d-flex align-items-center gap-3">
                            <div className="transaction-icon text-white rounded p-2">
                                {renderTransactionTypeIcon(transaction.type)}
                            </div>
                            <h4 className="card-title mb-1">{transactionTypeLabels[transaction.type]}:&nbsp;</h4>
                            <h4 className="card-text fw-bold">{getTransactionSign(transaction.type)}
                                {formatCurrency(transaction.amount, currencyCode)}</h4>
                        </div>
                    </div>
                    <div className="col-lg-2 d-flex">
                        {transaction.categoryName && (
                            <div className="d-flex flex-column gap-1 pt-2">
                                <h5 className="card-text mb-0">Категория</h5>
                                <h5 className="fw-bold">{transaction.categoryName}</h5>
                            </div>
                        )}
                    </div>

                    {isTransaction && (
                        <div className="col-lg-4">
                            <div className="d-flex gap-2 justify-content-end">
                                <button className="btn card-btn" onClick={() => setIsEditingTransaction(true)}>Редактировать</button>
                                <button className="btn card-btn" type="button" onClick={handleDeleteTransactionClick} disabled={isDeleting}>
                                    {isDeleting ? "Удаляем..." : "Удалить"}
                                </button>
                            </div>
                        </div>
                    )}

                    {isTransfer && (
                        <div className="col-lg-4">
                            <div className="d-flex gap-2 justify-content-end">
                                <button className="btn card-btn" onClick={() => handleEditTransfer()}>Редактировать</button>
                                <button className="btn card-btn" type="button" onClick={handleDeleteTransferClick} disabled={isDeleting}>
                                    {isDeleting ? "Удаляем..." : "Удалить"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {transaction.note &&
                    <div className="pt-3 border-top card-text">
                        <p className="alert alert-success">{transaction.note}</p>
                    </div>
                }
            </div>
        </article>
    );
}
