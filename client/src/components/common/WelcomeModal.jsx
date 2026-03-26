import { useState, useEffect } from 'react';
import { X, LayoutDashboard, Megaphone, Users, Palette, Activity, DollarSign, Target, BarChart3, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Real-Time Dashboard',
    desc: 'KPIs, spend pacing, frequency alerts, and platform breakdowns across all your accounts — one screen.',
  },
  {
    icon: Megaphone,
    title: 'Campaign Builder',
    desc: 'Create campaigns, ad sets, and ads with a step-by-step wizard. Set budgets, targeting, placements, and go live — or save as draft.',
  },
  {
    icon: Target,
    title: 'Audience Manager',
    desc: 'Build custom audiences from pixel data, customer lists, or engagement. Create lookalikes and check overlap before you launch.',
  },
  {
    icon: Palette,
    title: 'Creative Studio',
    desc: 'Upload assets, preview ads in device frames (Feed, Stories, Reels), manage copy variants, and track which creative wins.',
  },
  {
    icon: Activity,
    title: 'Pixel Health',
    desc: 'Monitor pixel firing status, event counts, match rates, and test events in real time. Catch tracking issues before they cost you.',
  },
  {
    icon: BarChart3,
    title: 'Cross-Account Insights',
    desc: 'Pull performance data across 5–20 client accounts. Breakdowns by campaign, ad set, ad, platform, placement, age, and gender.',
  },
  {
    icon: DollarSign,
    title: 'Budget Pacing',
    desc: 'See actual vs. projected spend against your budget cap. Get warned when campaigns are overpacing or underspending.',
  },
  {
    icon: Zap,
    title: 'UTM Tracking',
    desc: 'Auto-generate UTM parameters for every ad. Save templates, apply across campaigns, and keep attribution clean.',
  },
];

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('welcome_dismissed');
    if (!dismissed) setOpen(true);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem('welcome_dismissed', '1');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Close */}
        <button onClick={dismiss} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="border-b border-zinc-800 px-8 pb-6 pt-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Megaphone size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-100">AdFlow</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100">Your Meta ad buying command center.</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Manage Facebook and Instagram campaigns across all your client accounts from one place.
            No switching between Business Managers. No spreadsheets. Just results.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 px-8 py-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                <Icon size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="border-t border-zinc-800 px-8 py-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-600">Connect your Meta account in Settings to get started.</p>
            <button
              onClick={dismiss}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
