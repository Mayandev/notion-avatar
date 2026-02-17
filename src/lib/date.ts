import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/** Free tier weekly generation limit */
export const FREE_WEEKLY_LIMIT = 1;

/**
 * Get ISO week start (Monday) as YYYY-MM-DD
 */
export function getWeekStart(date: Date = new Date()): string {
  return dayjs(date).startOf('isoWeek').format('YYYY-MM-DD');
}
