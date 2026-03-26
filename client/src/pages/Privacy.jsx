export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Privacy Policy</h1>
      <p className="mb-6 text-xs text-zinc-500">Last updated: March 26, 2026</p>
      <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">1. Information We Collect</h2>
          <p>When you connect your Meta (Facebook/Instagram) account, we collect your Meta user ID, name, email, OAuth access token, ad account metadata, and campaign performance data.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">2. How We Use Your Information</h2>
          <p>We use your information solely to display ad account data, manage campaigns via the Meta Marketing API, and cache performance data. We do not sell, rent, or share your data with third parties.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">3. Data Storage & Security</h2>
          <p>Data is stored in a secure PostgreSQL database with row-level security. Access tokens are stored server-side and never exposed to the browser. All connections use HTTPS.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">4. Data Retention</h2>
          <p>We retain data while your account is active. Cached data expires after 15 minutes. You may request deletion at any time.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">5. Your Rights</h2>
          <p>You may disconnect your Meta account, request a data export, or request full deletion of your data by contacting us or visiting the <a href="/data-deletion" className="text-blue-400 hover:underline">data deletion page</a>.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">6. Contact</h2>
          <p>For privacy inquiries: <a href="mailto:jefdieselnyc@gmail.com" className="text-blue-400 hover:underline">jefdieselnyc@gmail.com</a></p>
        </section>
      </div>
    </div>
  );
}
