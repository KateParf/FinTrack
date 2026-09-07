import { FormEvent, useEffect, useState } from "react";
import { BalanceHistory, Expenses, Summary } from "../types/analytics";
import { getBalanceHistory, getExpensesByCategory, getSummary } from "../api/analyticsApi";
import { formatCurrency } from "../utils/formatMoney";
import { CircleFill } from "react-bootstrap-icons";

export function AnalyticsPage() {
    const [summary, setSummary] = useState<Summary[]>([]);
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

    const getRandomColor = () => `hsl(${Math.random() * 360}, 70%, 50%)`;

    return (
        <div className="m-4">
            <div className="row">
                {isLoading && (<p className="py-4 text-secondary">Загружаем статистику...</p>)}
                {!isLoading && error && (<p className="alert alert-danger mt-4">{error}</p>)}

                {!isLoading && !error && summary && (
                    summary.map(item => (
                    <div className="card col">
                        <div className="card-title h4 mt-3 mb-0">Доходы</div>
                        <div className="card-body">
                            <div className="card-text">
                                {formatCurrency(item.income, item.currencyCode)}
                            </div>
                        </div>
                    </div>
                )))}

                {!isLoading && !error && summary && (
                    summary.map(item => (
                    <div className="card col">
                        <div className="card-title h4 mt-3 mb-0">Расходы</div>
                        <div className="card-body">
                            <div className="card-text">
                                {formatCurrency(item.expenses, item.currencyCode)}
                            </div>
                        </div>
                    </div>
                )))}

                {!isLoading && !error && summary && (
                    summary.map(item => (
                    <div className="card col">
                        <div className="card-title h4 mt-3 mb-0">Сбережения</div>
                        <div className="card-body">
                            <div className="card-text">
                                {formatCurrency(item.savings, item.currencyCode)}
                            </div>
                        </div>
                    </div>
                )))}
            </div>

            <div className="row d-flex">
                {!isLoading && !error && expenses.length > 0 &&
                    (
                        <div className="card col">
                            <div className="card-title h4 mt-3 mb-0">Расходы по категориям</div>
                            <div className="card-body">
                                {expenses.map(expense => (
                                    <div className="card-text d-flex align-items-center">
                                        <CircleFill className="me-2" style={{ color: getRandomColor() }}></CircleFill>
                                        {expense.categoryName}: {formatCurrency(expense.amount, expense.currencyCode)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {!isLoading && !error && balanceHistory.length > 0 &&
                    (
                        <div className="card col">
                            <div className="card-title h4 mt-3 mb-0">История баланса</div>
                            <div className="card-body">
                                {balanceHistory.map(hist => (
                                    <div className="card-text">
                                        {hist.date}: {formatCurrency(hist.amount, hist.currencyCode)}
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