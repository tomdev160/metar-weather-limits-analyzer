import { useStore } from '../store/useStore';
import { BarChart2, Upload, Settings, Plane } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { activeView, setActiveView, limits, metarData } = useStore();

  const navItems = [
    { id: 'limits' as const, label: 'Limit Manager', icon: Settings },
    { id: 'upload' as const, label: 'METAR Upload', icon: Upload },
    { id: 'dashboard' as const, label: 'Analysis Dashboard', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold">METAR Analyse</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Dutch Airport Weather Limits</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              activeView === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Limits configured</span>
          <span className="text-white font-medium">{limits.length}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>METAR records</span>
          <span className="text-white font-medium">{metarData.length}</span>
        </div>
      </div>
    </aside>
  );
}
