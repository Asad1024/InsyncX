'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, Heart, DollarSign } from 'lucide-react';
import { useDisplaySettings } from '@/context/display-settings';
import { cn, formatPrice } from '@/lib/utils';
import { SpendingSparkline } from '@/components/account/SpendingSparkline';

const STAT_ICONS = {
  orders: ShoppingBag,
  wishlist: Heart,
  spent: DollarSign,
} as const;

export type StatCardIconKey = keyof typeof STAT_ICONS;

interface StatCardProps {
  label: string;
  value: string | number;
  /** Serializable icon id — icons are resolved inside this client component. */
  icon: StatCardIconKey;
  sub?: string;
  trend?: string;
  trendPositive?: boolean;
  /** Larger bento cell with optional spending sparkline */
  featured?: boolean;
  /** Last N monthly totals (e.g. 6) — only shown when `featured` */
  sparklineValues?: number[];
  className?: string;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function parseTargetNumber(value: string | number): { target: number; isMoney: boolean } {
  if (typeof value === 'number') return { target: value, isMoney: false };
  const cleaned = value.replace(/,/g, '').match(/[\d.]+/);
  const n = cleaned ? parseFloat(cleaned[0]!) : 0;
  return { target: Number.isFinite(n) ? n : 0, isMoney: true };
}

export function StatCard({
  label,
  value,
  icon,
  sub,
  trend,
  trendPositive,
  featured = false,
  sparklineValues,
  className,
}: StatCardProps) {
  const Icon = STAT_ICONS[icon];
  const { currencySymbol } = useDisplaySettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const { target, isMoney } = parseTargetNumber(value);
  const [display, setDisplay] = useState<string | number>(() =>
    isMoney ? formatPrice(0, currencySymbol) : 0
  );
  const startedRef = useRef(false);

  useEffect(() => {
    startedRef.current = false;
    setDisplay(isMoney ? formatPrice(0, currencySymbol) : 0);
    const el = rootRef.current;
    if (!el) return;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const duration = 1200;
      const t0 = performance.now();

      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / duration);
        const e = easeOutCubic(u);
        const current = target * e;
        if (isMoney) setDisplay(formatPrice(current, currencySymbol));
        else setDisplay(Math.round(current));
        if (u < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, target, isMoney, currencySymbol]);

  return (
    <div
      ref={rootRef}
      className={cn(
        'account-stat-card-shimmer group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[rgba(4,14,32,0.5)] p-6 backdrop-blur-[20px] transition-[transform,box-shadow,border-color] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[rgba(29,110,255,0.35)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.45),0_0_28px_rgba(29,110,255,0.12)] md:p-7',
        featured && 'md:min-h-[260px]',
        className
      )}
      style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-[140px] w-[140px] rounded-full md:h-[160px] md:w-[160px]"
        style={{
          background: 'radial-gradient(circle, rgba(29,110,255,0.22), transparent 68%)',
        }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            'mb-3 flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-[rgba(29,110,255,0.1)]',
            featured ? 'h-12 w-12' : 'h-11 w-11'
          )}
        >
          <Icon className={cn('text-[var(--cyan)]', featured ? 'h-6 w-6' : 'h-5 w-5')} strokeWidth={1.75} />
        </div>
        {trend != null && (
          <span
            className={`rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${
              trendPositive !== false ? 'bg-[rgba(34,197,94,0.12)] text-[#4ade80]' : 'bg-[rgba(239,68,68,0.12)] text-[#f87171]'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div
        className={cn(
          'relative font-display font-bold leading-none',
          featured ? 'text-[clamp(36px,5vw,48px)]' : 'text-[36px]'
        )}
        style={{
          background: 'linear-gradient(90deg, var(--blue), var(--cyan))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
        }}
      >
        {display}
      </div>
      <p className="relative mt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--white)]">
        {label}
      </p>
      {sub != null && (
        <p className="relative mt-0.5 font-sans text-[12px] text-[var(--muted)]">{sub}</p>
      )}
      {featured && sparklineValues != null && sparklineValues.length > 0 && (
        <SpendingSparkline values={sparklineValues} />
      )}
    </div>
  );
}
