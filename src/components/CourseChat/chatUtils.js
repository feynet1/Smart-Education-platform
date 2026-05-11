import { format, isToday } from 'date-fns';

/**
 * Format an ISO 8601 timestamp for display.
 * Today → "h:mm a"  (e.g. "10:35 AM")
 * Prior day → "MMM dd, h:mm a"  (e.g. "Jan 03, 10:35 AM")
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatMessageTime(isoString) {
  const date = new Date(isoString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  return format(date, 'MMM dd, h:mm a');
}
