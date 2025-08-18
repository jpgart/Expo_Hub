export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts
    }).format(new Date(date));
  } catch (_err) {
    return '';
  }
}

// Format numbers with abbreviations (k, M, B)
export function formatNumber(value: number, decimals: number = 1): string {
  if (value === 0) return '0';

  const absValue = Math.abs(value);
  let formatted: string;

  if (absValue >= 1e9) {
    formatted = (value / 1e9).toFixed(decimals) + 'B';
  } else if (absValue >= 1e6) {
    formatted = (value / 1e6).toFixed(decimals) + 'M';
  } else if (absValue >= 1e3) {
    formatted = (value / 1e3).toFixed(decimals) + 'k';
  } else {
    formatted = value.toFixed(decimals);
  }

  return formatted;
}

// Format kilograms with appropriate units
export function formatKilograms(kg: number): string {
  if (kg === 0) return '0 kg';

  if (kg >= 1e6) {
    return `${(kg / 1e6).toFixed(1)}M kg`;
  } else if (kg >= 1e3) {
    return `${(kg / 1e3).toFixed(1)}k kg`;
  } else {
    return `${kg.toFixed(0)} kg`;
  }
}

// Format boxes with appropriate units
export function formatBoxes(boxes: number): string {
  if (boxes === 0) return '0 boxes';

  if (boxes >= 1e6) {
    return `${(boxes / 1e6).toFixed(1)}M boxes`;
  } else if (boxes >= 1e3) {
    return `${(boxes / 1e3).toFixed(1)}k boxes`;
  } else {
    return `${boxes.toLocaleString()} boxes`;
  }
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  if (value === 0) return '0%';
  if (value < 0.1) return '<0.1%';
  return `${value.toFixed(decimals)}%`;
}

// Format YoY change with arrow and color
export function formatYoYChange(value: number | null): {
  text: string;
  color: string;
  arrow: string;
} {
  if (value === null || value === 0) {
    return { text: '0%', color: 'text-amber-600', arrow: '→' };
  }

  if (value > 0) {
    return {
      text: `+${value.toFixed(1)}%`,
      color: 'text-green-600',
      arrow: '↑'
    };
  } else {
    return { text: `${value.toFixed(1)}%`, color: 'text-red-600', arrow: '↓' };
  }
}

// Format week to readable date
export function formatWeek(week: string): string {
  if (!week || !week.includes('-W')) return week;

  try {
    const [year, weekNum] = week.split('-W');
    const weekStart = new Date(
      parseInt(year),
      0,
      1 + (parseInt(weekNum) - 1) * 7
    );
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } catch {
    return week;
  }
}

// Format month to readable format
export function formatMonth(month: string): string {
  if (!month) return month;

  try {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return month;
  }
}

// Calculate percentage change
export function calculatePercentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Normalize data to index 100 for comparison
export function normalizeToIndex100(
  data: Array<{ kilograms: number; boxes: number }>,
  metric: 'kilograms' | 'boxes' = 'kilograms'
): Array<{ kilograms: number; boxes: number; normalized: number }> {
  if (data.length === 0) return [];

  const firstValue = data[0][metric];
  if (firstValue === 0) return data.map((d) => ({ ...d, normalized: 0 }));

  return data.map((d) => ({
    ...d,
    normalized: (d[metric] / firstValue) * 100
  }));
}

// Get color for exporter (consistent across charts)
export function getExporterColor(exporterId: number): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6366F1' // Indigo
  ];

  return colors[exporterId % colors.length];
}

// Format tooltip content for charts
export function formatTooltipContent(
  data: any,
  metric: 'kilograms' | 'boxes' = 'kilograms'
): string {
  const value = data[metric];
  const formattedValue =
    metric === 'kilograms' ? formatKilograms(value) : formatBoxes(value);

  if (data.exporterName) {
    return `${data.exporterName}: ${formattedValue}`;
  }

  return formattedValue;
}

// Validate week format (YYYY-Www)
export function isValidWeekFormat(week: string): boolean {
  const weekRegex = /^\d{4}-W\d{2}$/;
  if (!weekRegex.test(week)) return false;

  const [, weekNum] = week.split('-W');
  const weekInt = parseInt(weekNum);
  return weekInt >= 1 && weekInt <= 53;
}

// Generate week range for filters
export function generateWeekRange(
  startWeek: string,
  endWeek: string
): string[] {
  if (!isValidWeekFormat(startWeek) || !isValidWeekFormat(endWeek)) return [];

  const weeks: string[] = [];
  let currentWeek = startWeek;

  while (currentWeek <= endWeek) {
    weeks.push(currentWeek);

    // Move to next week
    const [year, weekNum] = currentWeek.split('-W');
    const weekInt = parseInt(weekNum);

    if (weekInt === 53) {
      currentWeek = `${parseInt(year) + 1}-W01`;
    } else {
      currentWeek = `${year}-W${(weekInt + 1).toString().padStart(2, '0')}`;
    }
  }

  return weeks;
}

// Format currency (if needed in future)
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date range for display
export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  } catch {
    return `${startDate} - ${endDate}`;
  }
}
