import { cn } from '../../lib/utils';
import { HTMLAttributes } from 'react';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div className={cn('relative h-4 w-full overflow-hidden rounded-full bg-gray-200', className)} {...props}>
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
