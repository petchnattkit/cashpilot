import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
  secondary:
    'bg-transparent text-primary border border-primary hover:bg-primary/10 focus:ring-primary/50',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-300',
  danger:
    'bg-error text-white hover:bg-error/90 focus:ring-error/50',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const iconSizes: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const combinedClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner className={`${iconSizes[size]} mr-2`} />
      ) : leftIcon ? (
        <span className={`${iconSizes[size]} mr-2`}>{leftIcon}</span>
      ) : null}

      {children}

      {!isLoading && rightIcon && (
        <span className={`${iconSizes[size]} ml-2`}>{rightIcon}</span>
      )}
    </button>
  );
}

export { Button };
