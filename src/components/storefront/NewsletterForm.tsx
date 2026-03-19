'use client';

export function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: add newsletter signup logic later
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        className="flex-1 min-w-0 rounded-lg border bg-[var(--surface)] px-3 py-2.5 font-sans text-[13px] text-[var(--text)] placeholder:text-[var(--text-4)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        style={{ borderColor: 'var(--line)' }}
      />
      <button type="submit" className="rounded-lg bg-[var(--gold)] px-4 py-2.5 font-sans text-[13px] font-medium text-black hover:opacity-90 transition-opacity">
        Join
      </button>
    </form>
  );
}
