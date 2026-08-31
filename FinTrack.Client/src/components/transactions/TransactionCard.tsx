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
            <UpdateTransactionForm transaction={transaction} categories={categories} onUpdate={onUpdate} onCancel={() => setIsEditingTransaction(false)} />
        );
    }
    if (isEditingTransfer && transfer) {
        return (
            <UpdateTransferForm transfer={transfer} accounts={accounts} onUpdate={onUpdate} onCancel={() => setIsEditingTransfer(false)} />
        );
    }
    return (
        <article className="card">
            <div className="card-body">
                <div className="card-text">
                    <div>{formatDateTime(transaction.occurredAtUtc)}</div>
                    <div>{transactionTypeLabels[transaction.type]}:&nbsp;
                        {getTransactionSign(transaction.type)}{formatCurrency(transaction.amount, currencyCode)}
                    </div>
                    {transaction.categoryName && (
                        <div>Категория:&nbsp;{transaction.categoryName}</div>
                    )}
                    {transaction.note && (<p>{transaction.note}</p>)}
                </div>
                {isTransaction && (
                    <div>
                        <button className="card-btn" onClick={() => setIsEditingTransaction(true)}>Редактировать</button>
                        <button className="card-btn" type="button" onClick={handleDeleteTransactionClick} disabled={isDeleting}>
                            {isDeleting ? "Удаляем..." : "Удалить"}
                        </button>
                    </div>
                )}
                {isTransfer && (
                    <div>
                        <button className="card-btn" onClick={() => handleEditTransfer()}>Редактировать</button>
                        <button className="card-btn" type="button" onClick={handleDeleteTransferClick} disabled={isDeleting}>
                            {isDeleting ? "Удаляем..." : "Удалить"}
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}
