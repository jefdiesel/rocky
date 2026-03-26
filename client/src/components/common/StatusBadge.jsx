import clsx from 'clsx';

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  PAUSED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  DELETED: 'bg-red-500/15 text-red-400 border-red-500/30',
  DRAFT: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  ARCHIVED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  READY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  POPULATING: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ERROR: 'bg-red-500/15 text-red-400 border-red-500/30',
  INACTIVE: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  WEBSITE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  CUSTOMER_LIST: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  LOOKALIKE: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  ENGAGEMENT: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

export default function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide',
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
