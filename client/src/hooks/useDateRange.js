import { useState, useCallback, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfDay } from 'date-fns';

function getPresetDates(preset) {
  const today = startOfDay(new Date());
  switch (preset) {
    case 'today':
      return { start: today, end: today };
    case 'yesterday': {
      const y = subDays(today, 1);
      return { start: y, end: y };
    }
    case 'last_7d':
      return { start: subDays(today, 6), end: today };
    case 'last_14d':
      return { start: subDays(today, 13), end: today };
    case 'last_30d':
      return { start: subDays(today, 29), end: today };
    case 'this_month':
      return { start: startOfMonth(today), end: today };
    case 'last_month': {
      const lastMonth = subMonths(today, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    default:
      return { start: subDays(today, 6), end: today };
  }
}

export function useDateRange(defaultPreset = 'last_7d') {
  const [preset, setPreset] = useState(defaultPreset);
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);

  const dates = useMemo(() => {
    if (preset === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd) };
    }
    return getPresetDates(preset);
  }, [preset, customStart, customEnd]);

  const dateParams = useMemo(() => ({
    since: format(dates.start, 'yyyy-MM-dd'),
    until: format(dates.end, 'yyyy-MM-dd'),
  }), [dates]);

  const selectPreset = useCallback((p) => {
    setPreset(p);
  }, []);

  const setCustomRange = useCallback((start, end) => {
    setPreset('custom');
    setCustomStart(start);
    setCustomEnd(end);
  }, []);

  return {
    preset,
    dates,
    dateParams,
    selectPreset,
    setCustomRange,
    customStart,
    customEnd,
  };
}

export default useDateRange;
