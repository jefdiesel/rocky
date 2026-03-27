export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Terms of Service</h1>
      <p className="mb-6 text-xs text-zinc-500">Last updated: March 26, 2026</p>
      <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">1. Acceptance</h2>
          <p>By using Remi, you agree to these terms. If you do not agree, do not use the service.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">2. Service Description</h2>
          <p>Remi is an ad management tool that connects to the Meta Marketing API to help you create, manage, and monitor advertising campaigns across Facebook and Instagram.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">3. Account Responsibilities</h2>
          <p>You are responsible for maintaining the security of your Meta account credentials and for all activity that occurs through your connected accounts. You must have proper authorization to manage the ad accounts you connect.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">4. Ad Spend</h2>
          <p>Remi facilitates campaign creation and management but does not process payments. All ad spend is billed directly by Meta through your connected ad accounts.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">5. Limitation of Liability</h2>
          <p>Remi is provided "as is" without warranties. We are not liable for any campaign performance, ad spend, or policy violations resulting from your use of the platform.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">6. Termination</h2>
          <p>You may stop using Remi at any time by disconnecting your Meta account. We reserve the right to suspend access for violations of these terms.</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-100">7. Contact</h2>
          <p>Questions: <a href="mailto:jefdieselnyc@gmail.com" className="text-blue-400 hover:underline">jefdieselnyc@gmail.com</a></p>
        </section>
      </div>
    </div>
  );
}
