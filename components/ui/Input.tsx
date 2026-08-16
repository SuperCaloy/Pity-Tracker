import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-full rounded-2xl bg-foreground/5 p-1 ring-1 ring-foreground/10 transition-colors duration-700 ease-awwwards">
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-[calc(1rem-4px)] bg-surface px-4 py-2 text-base font-sans shadow-core transition-all duration-700 ease-awwwards',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent tabular-nums text-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-foreground/40',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';