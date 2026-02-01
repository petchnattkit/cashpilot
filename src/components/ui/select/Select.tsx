import { useId } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

const baseStyles = 'w-full border rounded-md px-3 py-2 text-neutral-900 bg-white transition-colors appearance-none cursor-pointer';
const focusStyles = 'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none';
const errorStyles = 'border-error focus:ring-error/20 focus:border-error';
const defaultStyles = 'border-neutral-300';
const disabledStyles = 'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed';

const ChevronDownIcon = () => (
    <svg
        className="w-5 h-5 text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

function Select({
    error,
    options,
    placeholder,
    className = '',
    id,
    ...props
}: SelectProps) {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    const selectClassName = [
        baseStyles,
        focusStyles,
        error ? errorStyles : defaultStyles,
        disabledStyles,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="w-full">
            <div className="relative">
                <select
                    id={selectId}
                    className={selectClassName}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={errorId}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDownIcon />
                </div>
            </div>
            {error && (
                <p id={errorId} className="mt-1 text-sm text-error">
                    {error}
                </p>
            )}
        </div>
    );
}

export { Select };
