import { cn } from '../../lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export const Slider = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={cn('w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600', className)}
      {...props}
    />
  )
);
Slider.displayName = 'Slider';
