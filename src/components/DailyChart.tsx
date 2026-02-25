import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';
import { getDailyStats } from '../utils/limitCheck';
import { WeatherLimit } from '../types';

interface DailyChartProps {
  airport: string;
  limit: WeatherLimit;
}

export function DailyChart({ airport, limit }: DailyChartProps) {
  const { metarData } = useStore();

  const chartData = useMemo(() => {
    const daily = getDailyStats(metarData, limit, airport);
    return daily.slice(-30).map((d) => ({
      date: d.date.slice(5), // MM-DD
      'UDP %': d.udpTotal > 0 ? parseFloat(((d.udpViolations / d.udpTotal) * 100).toFixed(1)) : 0,
      'Non-UDP %': d.nonUdpTotal > 0 ? parseFloat(((d.nonUdpViolations / d.nonUdpTotal) * 100).toFixed(1)) : 0,
    }));
  }, [metarData, limit, airport]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No daily data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip formatter={(value: number) => [`${value}%`, '']} />
        <Legend />
        <Bar dataKey="UDP %" fill="#3b82f6" />
        <Bar dataKey="Non-UDP %" fill="#94a3b8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
