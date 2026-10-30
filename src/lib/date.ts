/** Free tier daily generation limit */
export const FREE_DAILY_LIMIT = 1;

/**
 * Get the UTC quota day as YYYY-MM-DD (same day as database reservations)
 */
export function getToday(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
