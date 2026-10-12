import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'rounded-full font-bold transition-all duration-200 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-default';

  const variants = {
    primary: 'bg-accent text-black hover:bg-accent-strong hover:scale-[1.04]',
    secondary: 'border border-muted text-white hover:border-white hover:scale-[1.04]',
    ghost: 'text-subtle hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button className={clsx(baseClasses, variants[variant], sizes[size], fullWidth && 'w-full', className)} {...props}>
      {children}
    </button>
  );
}
