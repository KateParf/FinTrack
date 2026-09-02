import { archiveAccount, getAccounts, restoreAccount, updateAccount } from "../api/accountsApi";
import { FormEvent, useEffect, useState } from "react";
import { BalanceHistory, Expenses, Summary } from "../types/analytics";
import { getBalanceHistory, getExpensesByCategory, getSummary } from "../api/analyticsApi";
import { formatCurrency } from "../utils/formatMoney";

export function AnalyticsPage() {
    const [summary, setSummary] = useState<Summary>();
    const [expenses, setExpenses] = useState<Expenses[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function loadAnalytics() {
        setError(null);
        setIsLoading(true);
        try {
            const [summaryResponse, expensesResponse, balanceHistoryResponse] = await Promise.all([
                getSummary(),
                getExpensesByCategory(),
                getBalanceHistory({}, "month")
            ]);
            setSummary(summaryResponse);
            setExpenses(expensesResponse);
            setBalanceHistory(balanceHistoryResponse);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Ошибка при загрузке аналитики");
            setExpenses([]);
            setBalanceHistory([]);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { void loadAnalytics(); }, []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
                {isLoading && (<p>Загружаем статистику...</p>)}
                {!isLoading && error && (<p>{error}</p>)}

                {!isLoading && !error && summary &&
                    (
                        <div className="card">
                            <div className="card-title"><h4>Доходы</h4></div>
                            <div className="card-body">
                                <div className="card-text">
                                    {formatCurrency(summary.income, "RUB")}
                                </div>
                            </div>
                        </div>
                    )}

                {!isLoading && !error && summary && (
                    <div className="card">
                        <div className="card-title"><h4>Расходы</h4></div>
                        <div className="card-body">
                            <div className="card-text">
                                {formatCurrency(summary.expenses, "RUB")}
                            </div>
                        </div>
                    </div>
                )}
                {!isLoading && !error && summary && (
                    <div className="card">
                        <div className="card-title"><h4>Сбережения</h4></div>
                        <div className="card-body">
                            <div className="card-text">
                                {formatCurrency(summary.savings, "RUB")}
                            </div>
                        </div>
                    </div>
                )
                }
            </div>

            <div style={{ display: "flex", justifyContent: "space-around" }}>
                {!isLoading && !error && expenses.length > 0 &&
                    (
                        <div className="card">
                            <div className="card-title"><h4>Расходы по категориям</h4></div>
                            <div className="card-body">
                                {expenses.map(expense => (
                                    <div className="card-text">
                                        {expense.categoryName}: {formatCurrency(expense.amount, "RUB")}
                                        <progress className="card-text" value={expense.percentage} max="100" style={{ width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {!isLoading && !error && balanceHistory.length > 0 &&
                    (
                        <div className="card">
                            <div className="card-title"><h4>История баланса</h4></div>
                            <div className="card-body">
                                {balanceHistory.map(hist => (
                                    <div className="card-text">
                                        {hist.date}: {formatCurrency(hist.amount, "RUB")}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}