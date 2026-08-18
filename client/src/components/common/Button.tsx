import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, className, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full text-sm font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none h-12 py-2 px-6";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500 shadow-lg shadow-indigo-600/20",
    secondary: "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 border border-zinc-700 focus-visible:ring-zinc-600",
    outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 focus-visible:ring-zinc-600",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 focus-visible:ring-red-500",
  };
  
  return (
    <button className={cn(base, variants[variant], className)} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <span className="mr-2 animate-spin">⏳</span> : null}
      {children}
    </button>
  );
}
