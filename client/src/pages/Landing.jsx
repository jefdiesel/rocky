import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Mail, Zap } from 'lucide-react';

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
      // Still show success
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-400" />
          <span className="text-lg font-bold">Remi</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Log In
        </button>
      </nav>

      {/* Single-focus hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center -mt-16">

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Stop wrestling with<br />
            <span className="text-blue-400">Ads Manager.</span>
          </h1>

          <p className="mt-5 text-base text-zinc-400 sm:text-lg max-w-md mx-auto">
            Remi puts all your Meta campaigns, budgets, and performance in one clean dashboard. No more 20 tabs.
          </p>

          {/* 3 bullets max */}
          <div className="mt-8 flex flex-col gap-2.5 items-start max-w-xs mx-auto">
            {[
              'See every campaign in one view',
              'Launch ads in 3 steps, not 30 clicks',
              'Catch budget problems before they cost you',
            ].map((b) => (
              <div key={b} className="flex items-center gap-2.5">
                <CheckCircle size={15} className="text-blue-400 flex-shrink-0" />
                <span className="text-sm text-zinc-300 text-left">{b}</span>
              </div>
            ))}
          </div>

          {/* Email capture */}
          <div className="mt-10 max-w-sm mx-auto">
            {submitted ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4">
                <CheckCircle size={18} className="text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">You're in. We'll email you when it's ready.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-50 whitespace-nowrap"
                >
                  {submitting ? '...' : 'Get Access'}
                  <ArrowRight size={15} />
                </button>
              </form>
            )}
            <p className="mt-3 text-xs text-zinc-600">Free. No credit card. Early access spots are limited.</p>
          </div>
        </div>
      </main>

      {/* Minimal footer — no distractions */}
      <footer className="px-6 py-4 text-center">
        <p className="text-2xs text-zinc-700">&copy; 2026 Remi</p>
      </footer>
    </div>
  );
}
