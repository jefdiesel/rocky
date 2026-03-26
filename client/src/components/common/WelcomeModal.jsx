import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LayoutDashboard, Megaphone, Users, Palette, Activity, DollarSign, Target, BarChart3, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    title: 'Connect Your Meta Account',
    desc: 'Link your Facebook/Instagram ad account in one click. We use official Meta OAuth — your credentials are never stored.',
    icon: CheckCircle,
  },
  {
    title: 'See All Your Data Instantly',
    desc: 'Your campaigns, spend, audiences, and pixel data load automatically. No CSV exports, no switching between tabs.',
    icon: BarChart3,
  },
  {
    title: 'Build & Launch Campaigns',
    desc: 'Create new campaigns with our step-by-step wizard. Set budgets, targeting, placements, upload creatives, and go live.',
    icon: Megaphone,
  },
  {
    title: 'Monitor & Optimize',
    desc: 'Track performance in real time. Spot frequency fatigue, budget pacing issues, and winning creatives — all from one dashboard.',
    icon: Activity,
  },
];

const FEATURES = [
  { icon: LayoutDashboard, title: 'Performance Dashboard', desc: 'KPIs, spend trends, and breakdowns by platform, placement, age, and gender.' },
  { icon: Megaphone, title: 'Campaign Builder', desc: 'Step-by-step wizard to create campaigns, ad sets, and ads with live preview.' },
  { icon: Target, title: 'Audience Manager', desc: 'Custom audiences, lookalikes, overlap analysis, and customer list uploads.' },
  { icon: Palette, title: 'Creative Studio', desc: 'Upload assets, preview in device frames, and test headline/body combinations.' },
  { icon: Activity, title: 'Pixel Dashboard', desc: 'Monitor pixel health, event counts, match rates, and test events live.' },
  { icon: DollarSign, title: 'Budget Pacing', desc: 'Actual vs projected spend with alerts when campaigns over or underpace.' },
  { icon: Zap, title: 'UTM Tracking', desc: 'Auto-generate tracking parameters for every ad to keep attribution clean.' },
  { icon: Users, title: 'Multi-Account', desc: 'Manage all your ad accounts from one login. Switch between them instantly.' },
];

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0); // 0 = welcome, 1 = features
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem('welcome_dismissed');
    if (!dismissed) setOpen(true);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem('welcome_dismissed', '1');
  };

  const handleConnect = () => {
    dismiss();
    navigate('/settings');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <button onClick={dismiss} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 z-10">
          <X size={18} />
        </button>

        {page === 0 ? (
          <>
            {/* Welcome Page */}
            <div className="px-8 pb-4 pt-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <Megaphone size={16} className="text-white" />
                </div>
                <span className="text-lg font-bold text-zinc-100">AdFlow</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Manage your Facebook & Instagram ads in one place.</h2>
              <p className="mt-2 text-sm text-zinc-400">
                No more switching between Business Manager tabs. Connect your Meta account, and everything you need is right here.
              </p>
            </div>

            {/* How it works */}
            <div className="px-8 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">How it works</p>
              <div className="space-y-4">
                {STEPS.map(({ title, desc, icon: Icon }, i) => (
                  <div key={title} className="flex gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/15 text-xs font-bold text-blue-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-zinc-800 px-8 py-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage(1)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  See all features
                </button>
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-4 text-base font-bold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25"
                >
                  Connect Meta Account <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Features Page */}
            <div className="px-8 pb-2 pt-8">
              <h2 className="text-lg font-bold text-zinc-100">Everything you need to run ads</h2>
              <p className="mt-1 text-sm text-zinc-400">All powered by the official Meta Marketing API.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 px-8 py-4 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Icon size={15} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{title}</p>
                    <p className="mt-0.5 text-2xs leading-relaxed text-zinc-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 px-8 py-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage(0)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-4 text-base font-bold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25"
                >
                  Connect Meta Account <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
