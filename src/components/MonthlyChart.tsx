import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';
import { calculateStats } from '../utils/limitCheck';
import { format } from 'date-fns';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

interface MonthlyChartProps {
  airport: string;
}

export function MonthlyChart({ airport }: MonthlyChartProps) {
  const { limits, metarData } = useStore();

  const chartData = useMemo(() => {
    if (limits.length === 0 || metarData.length === 0) return [];

    const allMonths = new Set<string>();
    const limitStats: Record<string, Record<string, number>> = {};

    for (const limit of limits) {
      const stats = calculateStats(metarData, limit, airport);
      limitStats[limit.id] = {};
      for (const s of stats) {
        const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
        allMonths.add(key);
        limitStats[limit.id][key] = s.percentage;
      }
    }

    return Array.from(allMonths)
      .sort()
      .map((key) => {
        const [year, month] = key.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        const entry: Record<string, string | number> = {
          month: format(date, 'MMM yyyy'),
        };
        for (const limit of limits) {
          entry[limit.name] = parseFloat((limitStats[limit.id][key] ?? 0).toFixed(1));
        }
        return entry;
      });
  }, [limits, metarData, airport]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data to display. Upload METAR data and configure limits.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          label={{ value: 'Non-compliance %', angle: -90, position: 'insideLeft', offset: -5, fontSize: 12 }}
        />
        <Tooltip formatter={(value: number) => [`${value}%`, '']} />
        <Legend />
        {limits.map((limit, i) => (
          <Bar key={limit.id} dataKey={limit.name} fill={COLORS[i % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
