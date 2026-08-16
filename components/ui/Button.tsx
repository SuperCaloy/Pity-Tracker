import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative inline-flex items-center justify-center rounded-full font-sans font-medium transition-all duration-700 ease-awwwards focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          {
            'bg-accent text-accent-fg shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-glow': variant === 'primary',
            'bg-foreground/5 text-foreground ring-1 ring-foreground/10 hover:bg-foreground/10': variant === 'secondary',
            'hover:bg-foreground/5 text-foreground': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 pl-6 pr-2 text-base': size === 'md' && variant === 'primary',
            'h-12 px-6 text-base': size === 'md' && variant !== 'primary',
            'h-14 pl-8 pr-3 text-lg': size === 'lg' && variant === 'primary',
            'h-14 px-8 text-lg': size === 'lg' && variant !== 'primary',
          },
          className
        )}
        {...props}
      >
        <span className="flex-1 text-center">{children}</span>
        {variant === 'primary' && (
          <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 transition-transform duration-700 ease-awwwards group-hover:-translate-y-[1px] group-hover:translate-x-1 group-hover:scale-105">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 11L11 1M11 1H3.5M11 1V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';