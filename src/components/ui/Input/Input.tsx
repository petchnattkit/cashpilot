import { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
}

const baseStyles = 'w-full border rounded-md px-3 py-2 text-neutral-900 bg-white transition-colors';
const focusStyles = 'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none';
const errorStyles = 'border-error focus:ring-error/20 focus:border-error';
const defaultStyles = 'border-neutral-300';
const disabledStyles = 'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed';

function Input({
    error,
    leftAddon,
    rightAddon,
    className = '',
    id,
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    const inputClassName = [
        baseStyles,
        focusStyles,
        error ? errorStyles : defaultStyles,
        disabledStyles,
        leftAddon ? 'pl-10' : '',
        rightAddon ? 'pr-10' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="w-full">
            <div className="relative">
                {leftAddon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        {leftAddon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={inputClassName}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={errorId}
                    {...props}
                />
                {rightAddon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                        {rightAddon}
                    </div>
                )}
            </div>
            {error && (
                <p id={errorId} className="mt-1 text-sm text-error">
                    {error}
                </p>
            )}
        </div>
    );
}

export { Input };
