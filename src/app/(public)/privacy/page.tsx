import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | InsyncX',
  description: 'Privacy Policy for InsyncX marketplace.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div
        className="border-b py-8 px-6 md:px-12 bg-[var(--surface)]"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-[var(--text-4)] mb-1">Legal</p>
            <h1 className="font-display text-[32px] md:text-[40px] font-light text-[var(--text)]">Privacy Policy</h1>
            <p className="font-sans text-[13px] text-[var(--text-3)] mt-2">Last updated: March 19, 2026</p>
          </div>
          <Link
            href="/"
            className="font-sans text-[13px] font-medium text-[var(--gold)] hover:underline shrink-0"
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 md:px-12 py-12 font-sans text-[15px] leading-relaxed text-[var(--text-2)] space-y-8">
        <p className="text-[var(--text-3)] text-[14px] rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          This is a <strong className="text-[var(--text)]">placeholder template</strong>. Have it reviewed by qualified privacy/legal advisors and adapt it to your jurisdiction, data flows, and processors (e.g. Stripe, hosting, email).
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">1. Who we are</h2>
          <p>
            InsyncX operates this marketplace website and related services. This policy explains how we collect, use, and share personal information when you use the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">2. Information we collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-[var(--text-2)]">
            <li><strong className="text-[var(--text)]">Account:</strong> name, email, password (hashed), phone if provided, role (customer/vendor).</li>
            <li><strong className="text-[var(--text)]">Orders:</strong> shipping address, order contents, payment-related metadata processed by our payment providers.</li>
            <li><strong className="text-[var(--text)]">Usage:</strong> technical data such as device, browser, and logs for security and operations.</li>
            <li><strong className="text-[var(--text)]">Cookies:</strong> as needed for sign-in, preferences, and analytics if enabled.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">3. How we use information</h2>
          <p>
            We use data to provide and improve the service, process orders, authenticate users, communicate about transactions, prevent fraud, comply with law, and enforce our terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">4. Sharing</h2>
          <p>
            We may share information with vendors as needed to fulfil your orders (e.g. shipping details), with payment processors (e.g. Stripe) for payments, with infrastructure and email providers we use, and when required by law. We do not sell your personal information as a commodity; describe any “sale” or advertising sharing if applicable in your region.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">5. Retention &amp; security</h2>
          <p>
            We retain data as long as needed for the purposes above and as required by law. We use reasonable technical and organizational measures to protect data, but no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">6. Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or export your data, or to object to certain processing. Contact us to exercise these rights. You may also have the right to complain to a supervisory authority.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">7. Children</h2>
          <p>
            The service is not directed at children under the age required in your jurisdiction. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">8. International transfers</h2>
          <p>
            If we process data across borders, we use appropriate safeguards as required by applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">9. Changes</h2>
          <p>
            We may update this policy. We will post the new version on this page and update the “Last updated” date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">10. Contact</h2>
          <p>
            For privacy questions or requests, contact us through the channels provided on the website.
          </p>
        </section>

        <p className="pt-4 text-[13px] text-[var(--text-4)]">
          See also our{' '}
          <Link href="/terms" className="text-[var(--gold)] hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </article>
    </div>
  );
}
