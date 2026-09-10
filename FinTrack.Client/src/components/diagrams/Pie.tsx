import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Expenses } from "../../types/analytics";
import { formatCurrency } from "../../utils/formatMoney";

interface ExpensesPieChartProps {
    expenses: Expenses[];
}

const COLORS = ["#68904D", "#EE9B01", "#d32f2f", "#3A5A01", "#DA6A00", "#a61919"];

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
    if (expenses.length === 0) {
        return (
            <div className="alert alert-danger">Нет данных для отображения</div>
        );
    }

    return (
        <div className="expenses-pie">
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={expenses}
                        dataKey="amount" nameKey="categoryName"
                        cx="50%" cy="50%" outerRadius={100}
                    >
                        {expenses.map((expense, index) => (
                            <Cell key={expense.categoryId} fill={COLORS[index % COLORS.length]}/>
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={ (value) => formatCurrency(Number(value), expenses[0].currencyCode)}
                    />

                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}