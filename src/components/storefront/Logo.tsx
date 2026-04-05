import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  /** Display height in pixels (navbar ~36–40) */
  height?: number;
  className?: string;
}

/** Wordmark aspect (InsyncX logo.avif); keeps layout stable while width scales with height */
const LOGO_ASPECT = 5.2;

export function Logo({ height = 36, className = '' }: LogoProps) {
  const displayH = Math.max(24, Math.round(height));
  const displayW = Math.round(displayH * LOGO_ASPECT);

  return (
    <Link href="/" className={`inline-flex items-center shrink-0 ${className}`}>
      <Image
        src="/InsyncX logo.avif"
        alt="InsyncX"
        width={displayW}
        height={displayH}
        className="w-auto max-w-none object-contain object-left"
        style={{ height: displayH, width: 'auto' }}
        priority
      />
    </Link>
  );
}
