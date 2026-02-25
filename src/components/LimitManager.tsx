import { useState } from 'react';
import { useStore } from '../store/useStore';
import { LimitCard } from './LimitCard';
import { LimitForm } from './LimitForm';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus } from 'lucide-react';
import { WeatherLimit } from '../types';

export function LimitManager() {
  const { limits, addLimit, updateLimit, deleteLimit, selectedLimitId, setSelectedLimitId } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (data: Omit<WeatherLimit, 'id'>) => {
    addLimit({ ...data, id: crypto.randomUUID() });
    setIsAdding(false);
  };

  const handleUpdate = (data: Omit<WeatherLimit, 'id'>) => {
    if (!editingId) return;
    updateLimit({ ...data, id: editingId });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Limit Manager</h1>
          <p className="text-gray-500 mt-1">Configure weather limits for analysis</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Limit
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>New Weather Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <LimitForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
          </CardContent>
        </Card>
      )}

      {limits.length === 0 && !isAdding ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No limits configured yet.</p>
          <p className="text-sm mt-1">Click "Add Limit" to create your first weather limit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {limits.map((limit) =>
            editingId === limit.id ? (
              <Card key={limit.id}>
                <CardHeader>
                  <CardTitle>Edit Limit</CardTitle>
                </CardHeader>
                <CardContent>
                  <LimitForm initial={limit} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
                </CardContent>
              </Card>
            ) : (
              <LimitCard
                key={limit.id}
                limit={limit}
                isSelected={selectedLimitId === limit.id}
                onEdit={() => setEditingId(limit.id)}
                onDelete={() => deleteLimit(limit.id)}
                onSelect={() => setSelectedLimitId(selectedLimitId === limit.id ? null : limit.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
