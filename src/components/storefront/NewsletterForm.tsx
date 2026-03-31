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
        data-cursor="interactive"
        className="flex-1 min-w-0 rounded-[10px] border px-3 py-2.5 font-sans text-[13px] focus:outline-none"
        style={{
          background: 'rgba(6,18,50,0.55)',
          borderColor: 'rgba(29,110,255,0.18)',
          color: 'var(--white)',
          boxShadow: '0 0 0 rgba(0,0,0,0)',
        }}
      />
      <button
        type="submit"
        data-cursor="interactive"
        className="rounded-[10px] px-4 py-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))',
          boxShadow: '0 0 22px rgba(29,110,255,0.35)',
        }}
      >
        Join
      </button>
    </form>
  );
}
