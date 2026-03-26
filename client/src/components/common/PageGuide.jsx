import { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function PageGuide({ pageKey, title, tips }) {
  const storageKey = `rocky_guide_dismissed_${pageKey}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(storageKey, '1'); } catch {}
  };

  const reshow = () => {
    setDismissed(false);
    try { localStorage.removeItem(storageKey); } catch {}
  };

  if (dismissed) {
    return (
      <div className="flex justify-end mb-2">
        <button
          onClick={reshow}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-2xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title={`Show ${title} tips`}
        >
          <HelpCircle size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-lg border border-zinc-700/50 bg-zinc-800/60 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <HelpCircle size={14} className="mt-0.5 flex-shrink-0 text-zinc-400" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-300 mb-1.5">{title}</p>
            <ul className="space-y-1">
              {tips.map((tip, i) => (
                <li key={i} className="text-2xs leading-relaxed text-zinc-500">
                  <span className="text-zinc-600 mr-1">&bull;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="flex-shrink-0 rounded p-0.5 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-700/50 transition-colors"
          title="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
