import { useState } from 'react';
import { WeatherLimit } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';

interface LimitFormProps {
  initial?: WeatherLimit;
  onSave: (limit: Omit<WeatherLimit, 'id'>) => void;
  onCancel: () => void;
}

export function LimitForm({ initial, onSave, onCancel }: LimitFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [minVisibility, setMinVisibility] = useState(initial?.minVisibility ?? 5000);
  const [cloudRule, setCloudRule] = useState<WeatherLimit['cloudRule']>(initial?.cloudRule ?? 'strict');
  const [maxCloudHeight, setMaxCloudHeight] = useState(initial?.maxCloudHeight ?? 1000);
  const [timePeriod, setTimePeriod] = useState<WeatherLimit['timePeriod']>(initial?.timePeriod ?? 'udp');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, minVisibility, cloudRule, maxCloudHeight, timePeriod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Limit Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. VFR Minimum"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="visibility">Minimum Visibility (meters)</Label>
        <Input
          id="visibility"
          type="number"
          value={minVisibility}
          onChange={(e) => setMinVisibility(Number(e.target.value))}
          min={0}
          max={9999}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="cloudRule">Cloud Rule</Label>
        <Select
          id="cloudRule"
          value={cloudRule}
          onChange={(e) => setCloudRule(e.target.value as WeatherLimit['cloudRule'])}
          className="mt-1"
        >
          <option value="strict">Strict: No BKN/OVC/SCT below height</option>
          <option value="few-ok">FEW OK: No BKN/OVC below height</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="cloudHeight">Max Cloud Height (feet)</Label>
        <Input
          id="cloudHeight"
          type="number"
          value={maxCloudHeight}
          onChange={(e) => setMaxCloudHeight(Number(e.target.value))}
          min={0}
          step={100}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="timePeriod">Time Period</Label>
        <Select
          id="timePeriod"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as WeatherLimit['timePeriod'])}
          className="mt-1"
        >
          <option value="udp">UDP (Sunrise -15min to Sunset +15min)</option>
          <option value="outside-udp">Outside UDP</option>
          <option value="24/7">24/7</option>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">Save Limit</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
