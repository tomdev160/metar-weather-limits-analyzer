import { useStore } from '../store/useStore';
import { MonthlyChart } from './MonthlyChart';
import { DailyChart } from './DailyChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { calculateStats, checkLimit } from '../utils/limitCheck';
import { cn } from '../lib/utils';

const AIRPORTS = ['EHAM', 'EHGG', 'EHLE', 'EHJK', 'EHWO'];

export function AnalysisDashboard() {
  const { limits, metarData, selectedAirport, setSelectedAirport, selectedLimitId, setActiveView } = useStore();

  const selectedLimit = limits.find((l) => l.id === selectedLimitId);

  const overallStats = limits.map((limit) => {
    const stats = calculateStats(metarData, limit, selectedAirport);
    const total = stats.reduce((a, s) => a + s.total, 0);
    const violations = stats.reduce((a, s) => a + s.violations, 0);
    return {
      limit,
      total,
      violations,
      percentage: total > 0 ? (violations / total) * 100 : 0,
    };
  });

  const recentViolations = selectedLimit
    ? metarData
        .filter((m) => m.icao === selectedAirport)
        .map((m) => ({ metar: m, result: checkLimit(m, selectedLimit) }))
        .filter(({ result }) => result.violated)
        .slice(-10)
        .reverse()
    : [];

  if (metarData.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analysis Dashboard</h1>
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No METAR data loaded.</p>
          <button
            className="mt-4 text-blue-600 hover:underline text-sm"
            onClick={() => setActiveView('upload')}
          >
            Upload METAR data →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analysis Dashboard</h1>
          <p className="text-gray-500 mt-1">{metarData.length} METAR records loaded</p>
        </div>
      </div>

      {/* Airport Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {AIRPORTS.map((ap) => {
          const count = metarData.filter((m) => m.icao === ap).length;
          return (
            <button
              key={ap}
              onClick={() => setSelectedAirport(ap)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                selectedAirport === ap
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {ap}
              {count > 0 && (
                <span className="ml-1.5 text-xs text-gray-400">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {limits.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No limits configured. <button className="text-blue-600 hover:underline" onClick={() => setActiveView('limits')}>Add a limit →</button></p>
        </div>
      ) : (
        <>
          {/* Overall stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {overallStats.map(({ limit, total, violations, percentage }) => (
              <Card key={limit.id} className={selectedLimitId === limit.id ? 'ring-2 ring-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{limit.name}</p>
                      <p className="text-3xl font-bold mt-2 text-blue-600">{percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">non-compliance</p>
                    </div>
                    <Badge variant={percentage > 20 ? 'destructive' : percentage > 10 ? 'warning' : 'success'}>
                      {violations}/{total}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Non-Compliance — {selectedAirport}</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart airport={selectedAirport} />
            </CardContent>
          </Card>

          {/* Daily chart for selected limit */}
          {selectedLimit && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Overview — {selectedLimit.name} — {selectedAirport} (last 30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyChart airport={selectedAirport} limit={selectedLimit} />
              </CardContent>
            </Card>
          )}

          {/* Recent violations */}
          {selectedLimit && recentViolations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Violations — {selectedLimit.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4">Time (UTC)</th>
                        <th className="pb-2 pr-4">Visibility</th>
                        <th className="pb-2 pr-4">Clouds</th>
                        <th className="pb-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentViolations.map(({ metar, result }) => (
                        <tr key={metar.raw} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 font-mono text-xs">
                            {metar.datetime.toISOString().slice(0, 16).replace('T', ' ')}
                          </td>
                          <td className="py-2 pr-4">{metar.visibility}m</td>
                          <td className="py-2 pr-4 font-mono text-xs">
                            {metar.clouds.map((c) => `${c.type}${String(c.height / 100).padStart(3, '0')}`).join(' ') || '—'}
                          </td>
                          <td className="py-2 text-red-600 text-xs">{result.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
