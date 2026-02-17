import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Get ISO week start (Monday) as YYYY-MM-DD
 */
export function getWeekStart(date: Date = new Date()): string {
  return dayjs(date).startOf('isoWeek').format('YYYY-MM-DD');
}
