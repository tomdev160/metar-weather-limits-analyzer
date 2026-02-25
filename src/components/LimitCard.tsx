import { WeatherLimit } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Edit, Trash2, Eye, Clock } from 'lucide-react';

interface LimitCardProps {
  limit: WeatherLimit;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

export function LimitCard({ limit, onEdit, onDelete, onSelect, isSelected }: LimitCardProps) {
  const timePeriodLabel = {
    'udp': 'UDP',
    'outside-udp': 'Outside UDP',
    '24/7': '24/7',
  }[limit.timePeriod];

  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{limit.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>Visibility ≥ {limit.minVisibility}m</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">☁️</span>
                <span>
                  {limit.cloudRule === 'strict' ? 'No BKN/OVC/SCT' : 'No BKN/OVC'} below {limit.maxCloudHeight}ft
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{timePeriodLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant={limit.timePeriod === 'udp' ? 'default' : limit.timePeriod === '24/7' ? 'warning' : 'success'}>
              {timePeriodLabel}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={onSelect} className="flex-1">
            {isSelected ? 'Deselect' : 'Analyse'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
