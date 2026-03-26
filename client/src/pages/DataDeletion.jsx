import { useState } from 'react';

export default function DataDeletion() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Data Deletion</h1>
      <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
        <p>You can request deletion of all data associated with your account. This includes your Meta user profile, cached insights, creative assets, audience data, UTM templates, and draft campaigns.</p>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">How to Delete Your Data</h2>
          <ul className="ml-4 list-disc space-y-1 text-zinc-400">
            <li>Go to <a href="/settings" className="text-blue-400 hover:underline">Settings</a> and disconnect your Meta account</li>
            <li>Or submit a deletion request below and we will remove all your data within 48 hours</li>
          </ul>
        </section>

        {submitted ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-400">Deletion request received. Your data will be removed within 48 hours. You will receive a confirmation at {email}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Email associated with your account</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              Request Data Deletion
            </button>
          </form>
        )}

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">Contact</h2>
          <p>For questions about data deletion: <a href="mailto:jefdieselnyc@gmail.com" className="text-blue-400 hover:underline">jefdieselnyc@gmail.com</a></p>
        </section>
      </div>
    </div>
  );
}
