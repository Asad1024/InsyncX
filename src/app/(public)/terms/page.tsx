import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | InsyncX',
  description: 'Terms of Service for InsyncX marketplace.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div
        className="border-b py-8 px-6 md:px-12 bg-[var(--surface)]"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-[var(--text-4)] mb-1">Legal</p>
            <h1 className="font-display text-[32px] md:text-[40px] font-light text-[var(--text)]">Terms of Service</h1>
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
          This is a <strong className="text-[var(--text)]">placeholder template</strong> for your marketplace. Replace it with text reviewed by your legal counsel before going live.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">1. Agreement</h2>
          <p>
            By accessing or using InsyncX (“we,” “us,” “the platform”), you agree to these Terms of Service. If you do not agree, do not use the site or services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">2. Accounts</h2>
          <p>
            You are responsible for your account credentials and for all activity under your account. You must provide accurate information and keep it updated. We may suspend or terminate accounts that violate these terms or harm other users or the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">3. Marketplace &amp; vendors</h2>
          <p>
            InsyncX may host multiple independent sellers (“vendors”). Each vendor is responsible for their products, descriptions, compliance, and fulfilment unless we state otherwise. Your contract for a product is with the vendor; we provide the platform and payment facilitation where applicable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">4. Orders, pricing &amp; payment</h2>
          <p>
            Prices, shipping, taxes, and availability are shown at checkout where possible. We reserve the right to refuse or cancel orders (for example, for fraud, errors, or stock issues). Payment methods (including card or cash on delivery where offered) are described at checkout.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">5. Prohibited use</h2>
          <p>
            You may not misuse the platform, scrape data without permission, interfere with security, list illegal items, or harass others. Vendors must comply with applicable laws and our seller policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">6. Disclaimer &amp; limitation</h2>
          <p>
            The platform is provided “as is” to the extent permitted by law. We are not liable for indirect or consequential damages arising from use of the site or third-party vendor products, except where liability cannot be excluded by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">7. Changes</h2>
          <p>
            We may update these terms. Continued use after changes constitutes acceptance of the revised terms. Material changes may be communicated on the site or by email where appropriate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[20px] text-[var(--text)]">8. Contact</h2>
          <p>
            Questions about these terms: use the contact options provided on the site or your account area.
          </p>
        </section>

        <p className="pt-4 text-[13px] text-[var(--text-4)]">
          See also our{' '}
          <Link href="/privacy" className="text-[var(--gold)] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </div>
  );
}
