import { useState } from "react";
import { Transaction, TransactionType, transactionTypeLabels } from "../../types/transaction";
import { CategoryWithDepth } from "../../utils/flattenCategories";
import { formatDateTime } from "../../utils/formatDateTime";
import { formatCurrency, getTransactionSign } from "../../utils/formatMoney";
import { UpdateTransactionForm } from "./UpdateTransactionForm";

interface TransactionCardProps {
    transaction: Transaction;
    currencyCode: string;
    categories: CategoryWithDepth[];
    onUpdate: () => Promise<void>;
}

export function TransactionCard({ transaction, currencyCode, categories, onUpdate }: TransactionCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const canEdit = transaction.type === TransactionType.Income || transaction.type === TransactionType.Expense;

    if (isEditing) {
        return (
            <UpdateTransactionForm transaction={transaction} categories={categories} onUpdate={onUpdate} onCancel={() => setIsEditing(false)} />
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
                {canEdit && (
                    <button className="card-btn" onClick={() => setIsEditing(true)}>Редактировать</button>
                )}
            </div>
        </article>
    );
}
