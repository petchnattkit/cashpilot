import React from 'react';

type ScopeValue = 'week' | 'month' | 'year' | 'custom';

interface ScopeSelectorProps {
  value: ScopeValue;
  onChange: (value: ScopeValue) => void;
}

interface ScopeOption {
  value: ScopeValue;
  label: string;
}

const scopeOptions: ScopeOption[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
];

function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    _optionValue: ScopeValue,
    index: number
  ) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (index > 0) {
          onChange(scopeOptions[index - 1].value);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (index < scopeOptions.length - 1) {
          onChange(scopeOptions[index + 1].value);
        }
        break;
      case 'Home':
        event.preventDefault();
        onChange(scopeOptions[0].value);
        break;
      case 'End':
        event.preventDefault();
        onChange(scopeOptions[scopeOptions.length - 1].value);
        break;
    }
  };

  return (
    <div
      className="inline-flex rounded-lg border border-neutral-200 bg-white p-1"
      role="group"
      aria-label="Time scope selector"
    >
      {scopeOptions.map((option, index) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value, index)}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
              ${isActive
                ? 'bg-[#0F2042] text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }
            `}
            aria-pressed={isActive}
            aria-label={`Select ${option.label} view`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { ScopeSelector };
export type { ScopeValue, ScopeSelectorProps };
