import { NewsletterForm } from './NewsletterForm';

export function NewsletterSection() {
  return (
    <section className="py-20 px-12 bg-[var(--bg)] border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-6xl mx-auto">
        <div>
          <p className="section-label">Stay Updated</p>
          <h2 className="font-display font-light text-[var(--text)] leading-none text-[52px] mt-0">
            Stay In
          </h2>
          <h2 className="font-display font-light italic text-[var(--gold)] leading-none text-[52px] mt-0">
            Sync.
          </h2>
          <p className="font-sans text-[14px] text-[var(--text-3)] mt-4 leading-[1.7]">
            Get early access to new drops, exclusive offers, and store updates.
          </p>
        </div>
        <div className="flex items-center">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
