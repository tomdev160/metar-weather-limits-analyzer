import { Sidebar } from './components/Sidebar';
import { LimitManager } from './components/LimitManager';
import { METARUpload } from './components/METARUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { useStore } from './store/useStore';

export default function App() {
  const { activeView } = useStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {activeView === 'limits' && <LimitManager />}
          {activeView === 'upload' && <METARUpload />}
          {activeView === 'dashboard' && <AnalysisDashboard />}
        </div>
      </main>
    </div>
  );
}
