export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatMonthLabel(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
  }).format(new Date(value));
}

export function formatPoints(value: number): string {
  return `${value.toLocaleString()} pts`;
}
