import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
}

export function Input({ disabled, className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      disabled={disabled}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'green' | 'gray';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const variantClasses = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  gray: 'bg-gray-600 hover:bg-gray-700',
} as const;

export function Button({
  variant = 'blue',
  loading = false,
  loadingText,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`w-full text-white py-3 rounded-lg transition-colors font-medium 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${className}`}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
