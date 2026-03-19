'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const sizeMap = { sm: { icon: 12, gap: 2 }, md: { icon: 16, gap: 3 }, lg: { icon: 20, gap: 4 } };

export function StarRating({ value, max = 5, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const v = Math.min(max, Math.max(0, value));
  const display = hover ?? v;
  const { icon: iconSize, gap } = sizeMap[size];

  const handleClick = (i: number) => {
    if (interactive && onChange) onChange(i + 1);
  };

  return (
    <div
      className="flex items-center"
      style={{ gap: `${gap}px` }}
      onMouseLeave={() => interactive && setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(display);
        const half = !filled && i < display;
        return (
          <span
            key={i}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onClick={() => handleClick(i)}
            className={`inline-flex ${interactive ? 'cursor-pointer' : ''}`}
          >
            {half ? (
              <span className="relative inline-block" style={{ width: iconSize, height: iconSize }}>
                <Star
                  style={{ width: iconSize, height: iconSize, color: 'var(--text-4)' }}
                  className="absolute inset-0"
                />
                <Star
                  style={{
                    width: iconSize,
                    height: iconSize,
                    color: 'var(--gold)',
                    fill: 'var(--gold)',
                    clipPath: 'inset(0 50% 0 0)',
                  }}
                  className="absolute inset-0"
                />
              </span>
            ) : (
              <Star
                style={{
                  width: iconSize,
                  height: iconSize,
                  color: filled ? 'var(--gold)' : 'var(--text-4)',
                  fill: filled ? 'var(--gold)' : 'none',
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
