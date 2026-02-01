import { differenceInDays, format, parseISO } from 'date-fns';

/**
 * Format x-axis labels with user-friendly relative time
 * - "Today" for current date
 * - "+Nd" for first 14 days
 * - "+Nw" for 2-8 weeks (up to 60 days)
 * - "MMM" (Jan, Feb) for longer periods (>60 days)
 *
 * @param dateStr - ISO date string to format
 * @param startDate - Reference date (typically the first date in the dataset)
 * @returns Formatted label string
 */
export const formatXAxisLabel = (dateStr: string, startDate: Date): string => {
  try {
    const date = parseISO(dateStr);
    const daysDiff = differenceInDays(date, startDate);

    if (daysDiff === 0) return 'Today';
    if (daysDiff <= 14) return `+${daysDiff}d`;
    if (daysDiff <= 60) return `+${Math.floor(daysDiff / 7)}w`;
    return format(date, 'MMM');
  } catch {
    return dateStr;
  }
};
