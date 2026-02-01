import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from './DateRangePicker';

describe('DateRangePicker', () => {
  describe('Rendering', () => {
    it('renders both date inputs', () => {
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Start date')).toBeInTheDocument();
      expect(screen.getByLabelText('End date')).toBeInTheDocument();
    });

    it('renders labels for both inputs', () => {
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('displays date format hint', () => {
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.getByText('Format: YYYY-MM-DD')).toBeInTheDocument();
    });

    it('renders with initial date values', () => {
      render(
        <DateRangePicker
          startDate="2025-01-01"
          endDate="2025-12-31"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      const startInput = screen.getByLabelText('Start date') as HTMLInputElement;
      const endInput = screen.getByLabelText('End date') as HTMLInputElement;

      expect(startInput.value).toBe('2025-01-01');
      expect(endInput.value).toBe('2025-12-31');
    });
  });

  describe('onChange callbacks', () => {
    it('calls onStartDateChange when start date changes', () => {
      const handleStartChange = vi.fn();
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={handleStartChange}
          onEndDateChange={() => {}}
        />
      );

      const startInput = screen.getByLabelText('Start date');
      fireEvent.change(startInput, { target: { value: '2025-06-15' } });

      expect(handleStartChange).toHaveBeenCalledWith('2025-06-15');
    });

    it('calls onEndDateChange when end date changes', () => {
      const handleEndChange = vi.fn();
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={handleEndChange}
        />
      );

      const endInput = screen.getByLabelText('End date');
      fireEvent.change(endInput, { target: { value: '2025-12-31' } });

      expect(handleEndChange).toHaveBeenCalledWith('2025-12-31');
    });

    it('calls both handlers when both dates change', () => {
      const handleStartChange = vi.fn();
      const handleEndChange = vi.fn();
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={handleStartChange}
          onEndDateChange={handleEndChange}
        />
      );

      const startInput = screen.getByLabelText('Start date');
      const endInput = screen.getByLabelText('End date');

      fireEvent.change(startInput, { target: { value: '2025-01-01' } });
      fireEvent.change(endInput, { target: { value: '2025-12-31' } });

      expect(handleStartChange).toHaveBeenCalledWith('2025-01-01');
      expect(handleEndChange).toHaveBeenCalledWith('2025-12-31');
    });
  });

  describe('Validation', () => {
    it('shows error when end date is before start date', () => {
      render(
        <DateRangePicker
          startDate="2025-06-01"
          endDate="2025-05-01"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
    });

    it('does not show error when end date is after start date', () => {
      render(
        <DateRangePicker
          startDate="2025-01-01"
          endDate="2025-12-31"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.queryByText('End date must be after start date')).not.toBeInTheDocument();
    });

    it('does not show error when dates are equal', () => {
      render(
        <DateRangePicker
          startDate="2025-06-15"
          endDate="2025-06-15"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.queryByText('End date must be after start date')).not.toBeInTheDocument();
    });

    it('does not show error when dates are empty', () => {
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.queryByText('End date must be after start date')).not.toBeInTheDocument();
    });

    it('clears error when invalid range is corrected', () => {
      const { rerender } = render(
        <DateRangePicker
          startDate="2025-06-01"
          endDate="2025-05-01"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();

      rerender(
        <DateRangePicker
          startDate="2025-06-01"
          endDate="2025-07-01"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      expect(screen.queryByText('End date must be after start date')).not.toBeInTheDocument();
    });
  });

  describe('min/max constraints', () => {
    it('respects minDate constraint on both inputs', () => {
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
          minDate="2025-01-01"
        />
      );

      const startInput = screen.getByLabelText('Start date') as HTMLInputElement;
      const endInput = screen.getByLabelText('End date') as HTMLInputElement;

      expect(startInput).toHaveAttribute('min', '2025-01-01');
      expect(endInput).toHaveAttribute('min', '2025-01-01');
    });

    it('respects maxDate constraint on both inputs', () => {
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
          maxDate="2025-12-31"
        />
      );

      const startInput = screen.getByLabelText('Start date') as HTMLInputElement;
      const endInput = screen.getByLabelText('End date') as HTMLInputElement;

      expect(startInput).toHaveAttribute('max', '2025-12-31');
      expect(endInput).toHaveAttribute('max', '2025-12-31');
    });

    it('respects both minDate and maxDate constraints', () => {
      render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
          minDate="2025-01-01"
          maxDate="2025-12-31"
        />
      );

      const startInput = screen.getByLabelText('Start date') as HTMLInputElement;
      const endInput = screen.getByLabelText('End date') as HTMLInputElement;

      expect(startInput).toHaveAttribute('min', '2025-01-01');
      expect(startInput).toHaveAttribute('max', '2025-12-31');
      expect(endInput).toHaveAttribute('min', '2025-01-01');
      expect(endInput).toHaveAttribute('max', '2025-12-31');
    });
  });

  describe('Layout', () => {
    it('renders inputs side by side with gap', () => {
      const { container } = render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      const flexContainer = container.querySelector('.flex.gap-4');
      expect(flexContainer).toBeInTheDocument();
    });

    it('inputs have equal flex width', () => {
      const { container } = render(
        <DateRangePicker
          startDate=""
          endDate=""
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      );

      const flexItems = container.querySelectorAll('.flex-1');
      expect(flexItems.length).toBe(2);
    });
  });
});
