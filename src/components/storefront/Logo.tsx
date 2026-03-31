import Link from 'next/link';

interface LogoProps {
  /** Max height in pixels (e.g. 28 for navbar) */
  height?: number;
  className?: string;
}

export function Logo({ height = 28, className = '' }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center shrink-0 ${className}`}>
      <span
        className="font-display font-black tracking-[-0.08em] leading-none insync-gradient-text"
        style={{ fontSize: Math.max(22, Math.round(height * 0.48)) }}
        aria-label="INSYNC"
      >
        INSYNC
      </span>
    </Link>
  );
}
