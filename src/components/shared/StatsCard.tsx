import type { LucideIcon } from 'lucide-react';

type Color = 'gold' | 'blue' | 'green' | 'red';

const colorStyles: Record<Color, { bg: string; border: string; icon: string; value: string }> = {
  gold: {
    bg: 'var(--gold-bg)',
    border: 'var(--line-gold)',
    icon: 'var(--gold)',
    value: 'var(--gold)',
  },
  blue: {
    bg: 'var(--blue-bg)',
    border: 'rgba(59,130,246,0.2)',
    icon: 'var(--blue)',
    value: 'var(--text)',
  },
  green: {
    bg: 'var(--green-bg)',
    border: 'rgba(34,197,94,0.2)',
    icon: 'var(--green)',
    value: 'var(--text)',
  },
  red: {
    bg: 'var(--red-bg)',
    border: 'rgba(239,68,68,0.2)',
    icon: 'var(--red)',
    value: 'var(--text)',
  },
};

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendLabel?: string;
  color?: Color;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'gold',
}: StatsCardProps) {
  const style = colorStyles[color];
  const trendPositive = trend != null && !trend.startsWith('↓');

  return (
    <div className="card flex flex-col gap-0" style={{ padding: 24 }}>
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center border shrink-0"
          style={{ background: style.bg, borderColor: style.border }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: style.icon }} />
        </div>
        {trend != null && (
          <span
            className={`badge font-sans text-[11px] font-semibold ${trendPositive ? 'badge-green' : 'badge-red'}`}
          >
            {trend}
          </span>
        )}
      </div>
      <div
        className="font-display text-[44px] font-light leading-none"
        style={{ color: style.value }}
      >
        {value}
      </div>
      <p
        className="font-sans text-[12px] font-medium uppercase tracking-[0.06em] mt-2"
        style={{ color: 'var(--text-3)' }}
      >
        {label}
      </p>
      {trendLabel != null && (
        <p className="font-sans text-[11px] mt-1" style={{ color: 'var(--text-4)' }}>
          {trendLabel}
        </p>
      )}
    </div>
  );
}
