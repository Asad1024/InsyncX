'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LogoProps {
  /** Max height in pixels (e.g. 28 for navbar) */
  height?: number;
  className?: string;
}

export function Logo({ height = 28, className = '' }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/" className={`inline-flex items-center shrink-0 ${className}`}>
      {!mounted || !imgError ? (
        <img
          src="/InsyncX%20logo.avif"
          alt="InsyncX"
          className="h-auto w-auto object-contain object-left"
          style={{ maxHeight: height }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-display text-[28px] font-light flex items-baseline">
          <span className="text-[#f0ede6]">Insync</span>
          <span className="text-[#c9a96e]">X</span>
        </span>
      )}
    </Link>
  );
}
