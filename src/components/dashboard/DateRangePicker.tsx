import { useId, useMemo } from 'react';
import { Input } from '../ui/Input/Input';
import { Label } from '../ui/typography/Label';

interface DateRangePickerProps {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string; // Optional minimum selectable date
  maxDate?: string; // Optional maximum selectable date
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

function validateDateRange(startDate: string, endDate: string): ValidationResult {
  if (!startDate || !endDate) {
    return { isValid: true };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: true };
  }

  if (end < start) {
    return {
      isValid: false,
      error: 'End date must be after start date',
    };
  }

  return { isValid: true };
}

function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const startId = useId();
  const endId = useId();

  const validation = useMemo(
    () => validateDateRange(startDate, endDate),
    [startDate, endDate]
  );

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStartDateChange(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEndDateChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor={startId}>Start Date</Label>
          <Input
            id={startId}
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={minDate}
            max={maxDate}
            aria-label="Start date"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor={endId}>End Date</Label>
          <Input
            id={endId}
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={minDate}
            max={maxDate}
            aria-label="End date"
            error={validation.error}
          />
        </div>
      </div>
      <p className="text-xs text-neutral-500">
        Format: YYYY-MM-DD
      </p>
    </div>
  );
}

export { DateRangePicker };
export type { DateRangePickerProps };
