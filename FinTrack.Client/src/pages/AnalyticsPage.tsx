import { FormEvent, useEffect, useState } from "react";
import { BalanceHistory, Expenses, Summary } from "../types/analytics";
import { getBalanceHistory, getExpensesByCategory, getSummary } from "../api/analyticsApi";
import { formatCurrency } from "../utils/formatMoney";
import { CircleFill } from "react-bootstrap-icons";
import { ExpensesPieChart } from "../components/diagrams/Pie";
import { BalanceHistoryLineChart } from "../components/diagrams/LineChart";

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

    return (
        <div className="p-3 align-content-center vh-100">
            <div className="row">
                {isLoading && (<p className="py-4 text-secondary">Загружаем статистику...</p>)}
                {!isLoading && error && (<p className="alert alert-danger mt-4">{error}</p>)}

                {!isLoading && !error && summary && (
                    summary.map(item => (
                        <div className="card col">
                            <div className="card-body">
                                <h4 className="card-title">Доходы</h4>
                                <div className="card-text">
                                    {formatCurrency(item.income, item.currencyCode)}
                                </div>
                            </div>
                        </div>
                    )))}

                {!isLoading && !error && summary && (
                    summary.map(item => (
                        <div className="card col">
                            <div className="card-body">
                                <h4 className="card-title">Расходы</h4>
                                <div className="card-text">
                                    {formatCurrency(item.expenses, item.currencyCode)}
                                </div>
                            </div>
                        </div>
                    )))}

                {!isLoading && !error && summary && (
                    summary.map(item => (
                        <div className="card col">
                            <div className="card-body">
                                <h4 className="card-title">Сбережения</h4>
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
                            <div className="card-body">
                                <h4 className="card-title">Расходы по категориям</h4>
                                <ExpensesPieChart expenses={expenses.slice(0, 6)} />
                                <div className="mt-3">
                                    {expenses.map(expense => (
                                        <div key={expense.categoryId} className="card-text mb-1">
                                            {expense.categoryName}:&nbsp;
                                            <b>{formatCurrency(expense.amount, expense.currencyCode)}</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }

                {!isLoading && !error && balanceHistory.length > 0 &&
                    (
                        <div className="card col">
                            <div className="card-body">
                                <h4 className="card-title">История баланса</h4>
                                <BalanceHistoryLineChart balanceHistory={balanceHistory}/>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}