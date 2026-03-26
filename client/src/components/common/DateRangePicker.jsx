import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { DATE_PRESETS } from '../../utils/constants.js';
import { formatDateRange } from '../../utils/format.js';

export default function DateRangePicker({ preset, dates, onPresetChange, onCustomRange, customStart, customEnd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayText = preset === 'custom'
    ? formatDateRange(dates.start, dates.end)
    : DATE_PRESETS.find((p) => p.value === preset)?.label || 'Select range';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors"
      >
        <Calendar size={13} className="text-zinc-500" />
        <span className="max-w-[180px] truncate">{displayText}</span>
        <ChevronDown size={13} className={clsx('text-zinc-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-xl">
          <div className="grid grid-cols-2 gap-1 mb-3">
            {DATE_PRESETS.filter((p) => p.value !== 'custom').map((p) => (
              <button
                key={p.value}
                onClick={() => { onPresetChange(p.value); setOpen(false); }}
                className={clsx(
                  'rounded px-2 py-1.5 text-xs transition-colors',
                  preset === p.value
                    ? 'bg-primary-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="border-t border-zinc-700 pt-3">
            <p className="mb-2 text-2xs font-medium uppercase tracking-wide text-zinc-500">Custom Range</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart || ''}
                onChange={(e) => onCustomRange?.(e.target.value, customEnd || e.target.value)}
                className="flex-1 text-xs"
              />
              <span className="text-zinc-500 text-xs">to</span>
              <input
                type="date"
                value={customEnd || ''}
                onChange={(e) => onCustomRange?.(customStart || e.target.value, e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
