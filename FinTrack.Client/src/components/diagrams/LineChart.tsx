import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, createHorizontalChart } from 'recharts';
import { BalanceHistory } from '../../types/analytics';

interface BalanceHistoryLineChartProps {
    balanceHistory: BalanceHistory[];
}
const Typed = createHorizontalChart<BalanceHistory, string, number>()({ XAxis, YAxis, Tooltip, Line });

export function BalanceHistoryLineChart({ balanceHistory }: BalanceHistoryLineChartProps) {
    if (balanceHistory.length === 0) {
        return (
            <div className="alert alert-danger">Нет данных для отображения</div>
        );
    }
    return (
        <Typed.LineChart
            style={{ width: '100%', maxWidth: '40vw', height: '100%', maxHeight: '40vh', aspectRatio: 1.618 }}
            responsive
            data={balanceHistory}
            margin={{ top: 5, right: 0, left: 0, bottom: 5, }}
        >
            <CartesianGrid stroke="#C8D2D1"/>
            <Typed.XAxis dataKey="date" tickMargin={10}/>
            <Typed.YAxis width="auto" tickMargin={10}/>
            <Tooltip />
            <Legend />
            <Typed.Line dataKey="amount" stroke="var(--primary-color-dark)" strokeWidth={3}/>
        </Typed.LineChart>
    );
}