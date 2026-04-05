'use client';

import { useId, useMemo } from 'react';

/** Normalized mini chart for “Total spent” bento card (6 points = last 6 months). */
export function SpendingSparkline({ values }: { values: number[] }) {
  const id = useId();
  const { linePoints, fillPoints, max } = useMemo(() => {
    const safe = values.length > 0 ? values : [0];
    const m = Math.max(...safe, 1);
    const n = safe.length;
    const coords = safe.map((v, i) => {
      const x = n <= 1 ? 50 : (i / (n - 1)) * 100;
      const y = 88 - (v / m) * 72;
      return [x, y] as const;
    });
    const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
    const fill = `0,92 ${coords.map(([x, y]) => `${x},${y}`).join(' ')} 100,92`;
    return { linePoints: line, fillPoints: fill, max: m };
  }, [values]);

  return (
    <div className="mt-auto pt-4">
      <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        Spending trend
      </p>
      <svg
        viewBox="0 0 100 92"
        preserveAspectRatio="none"
        className="h-16 w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--blue)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(29,110,255,0.35)" />
            <stop offset="100%" stopColor="rgba(29,110,255,0)" />
          </linearGradient>
        </defs>
        {max > 0 && (
          <polygon fill={`url(#${id}-fill)`} points={fillPoints} className="opacity-90" />
        )}
        <polyline
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
