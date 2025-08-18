import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
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
  const baseClasses = 'rounded-full font-medium transition-all duration-300 cursor-pointer focus:outline-none';

  const variants = {
    primary: 'bg-purple-500 text-white hover:bg-purple-600',
    secondary: 'border-2 border-purple-500 bg-white text-purple-500 hover:bg-gray-100',
    ghost: 'bg-white/90 hover:bg-white text-gray-400 hover:text-purple-500 hover:scale-105 shadow-md',
    icon: 'rounded-full p-2 transition-all duration-300 shadow-md',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2',
    lg: 'p-3',
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    variant !== 'icon' && sizes[size],
    fullWidth && 'w-full',
    className
  );

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
