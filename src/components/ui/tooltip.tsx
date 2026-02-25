import { cn } from '../../lib/utils';
import { HTMLAttributes, useState } from 'react';
import type { ReactNode } from 'react';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 text-sm text-white bg-gray-800 rounded-md whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}
