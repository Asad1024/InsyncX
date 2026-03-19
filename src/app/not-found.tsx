import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4">
      <p className="font-display font-light text-[#444440]" style={{ fontSize: 'clamp(6rem, 20vw, 180px)', lineHeight: 1 }}>
        404
      </p>
      <h1 className="font-display text-[40px] font-light text-[#f0ede6] mt-4">Page not found</h1>
      <p className="font-sans text-[14px] text-[#888880] mt-4 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-10 font-sans text-[11px] font-semibold uppercase tracking-[0.15em] px-6 py-3 bg-[#c9a96e] text-[#080808] hover:bg-[#e8c98a] transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
