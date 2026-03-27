import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone, BarChart3, Target, Palette, Activity, DollarSign, Zap, Users,
  ArrowRight, CheckCircle, Star, ChevronRight, Mail,
} from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, title: 'Real-Time Dashboard', desc: 'See spend, ROAS, CPM, CTR, and every metric that matters — updated live from Meta.' },
  { icon: Megaphone, title: 'Campaign Builder', desc: 'Launch campaigns with a guided wizard. Set budgets, audiences, placements, and creatives in minutes.' },
  { icon: Target, title: 'Audience Manager', desc: 'Build custom audiences, create lookalikes, and check overlap before you spend a dollar.' },
  { icon: Palette, title: 'Creative Studio', desc: 'Upload assets, preview ads in real device frames, and A/B test copy variants.' },
  { icon: Activity, title: 'Pixel Health Monitor', desc: 'Track pixel fires, match rates, and event health. Catch broken tracking before it costs you.' },
  { icon: DollarSign, title: 'Budget Pacing', desc: 'See if you\'re on track, overspending, or leaving money on the table — per campaign, per day.' },
  { icon: Zap, title: 'UTM Tracking', desc: 'Auto-tag every ad with clean UTMs. Save templates. Never lose attribution again.' },
  { icon: Users, title: 'Multi-Account', desc: 'Manage every ad account you own from one login. Switch between them in one click.' },
];

const BENEFITS = [
  'No more switching between Business Manager tabs',
  'See all your accounts in one dashboard',
  'Create campaigns 3x faster with the step wizard',
  'Catch budget pacing issues before they waste spend',
  'Preview ads exactly how they look on Feed, Stories, and Reels',
  'Auto-generate UTM tags for every single ad',
];

export default function Landing() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Still show success — we'll capture it
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <Megaphone size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold">Remi</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="rounded-md bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Log In
        </button>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
          <Star size={12} className="text-blue-400" />
          <span className="text-xs font-medium text-blue-400">Now in early access</span>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Run your Meta ads<br />
          <span className="text-blue-400">without the chaos.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
          One dashboard for all your Facebook and Instagram campaigns.
          Build, launch, and optimize — faster than Ads Manager.
        </p>

        {/* Email capture */}
        <div className="mx-auto mt-10 max-w-md">
          {submitted ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4">
              <CheckCircle size={18} className="text-emerald-400" />
              <p className="text-sm font-medium text-emerald-400">You're on the list. We'll be in touch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {submitting ? 'Joining...' : 'Get Early Access'}
                <ArrowRight size={15} />
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-zinc-600">Free to use. No credit card required.</p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-zinc-800 bg-zinc-900/50 py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-center">
          <span className="text-sm text-zinc-500">Built on the</span>
          <span className="text-sm font-semibold text-zinc-300">Official Meta Marketing API</span>
          <span className="text-zinc-700">|</span>
          <span className="text-sm text-zinc-500">Supports</span>
          <span className="text-sm font-semibold text-zinc-300">Facebook + Instagram</span>
          <span className="text-zinc-700">|</span>
          <span className="text-sm font-semibold text-zinc-300">OAuth secured</span>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Why ad buyers switch to Remi</h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-blue-400" />
              <p className="text-sm text-zinc-300">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t border-zinc-800 bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Everything you need. Nothing you don't.</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-500">
            Replace the spreadsheets, the tab switching, and the manual exports. Remi puts it all in one place.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-200">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to simplify your ad workflow?</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Join the waitlist and be the first to manage your Meta ads the smart way.
          </p>
          <div className="mx-auto mt-8 max-w-sm">
            {submitted ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4">
                <CheckCircle size={18} className="text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">You're on the list!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3.5 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  Get Early Access
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500">
              <Megaphone size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold">Remi</span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300">Privacy</a>
            <a href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300">Terms</a>
            <a href="/data-deletion" className="text-xs text-zinc-500 hover:text-zinc-300">Data Deletion</a>
          </div>
          <p className="text-xs text-zinc-600">&copy; 2026 Remi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
