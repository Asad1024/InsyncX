import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
  trend?: string; // e.g. "+12%" or "-5%"
  trendPositive?: boolean;
}

export function StatCard({ label, value, icon: Icon, sub, trend, trendPositive }: StatCardProps) {
  return (
    <div className="card card-p flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center border shrink-0"
          style={{
            background: 'var(--gold-bg)',
            borderColor: 'var(--line-gold)',
          }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--gold)' }} />
        </div>
        {trend != null && (
          <span
            className={`badge ${trendPositive !== false ? 'badge-green' : 'badge-red'} font-sans text-[11px] font-semibold`}
          >
            {trend}
          </span>
        )}
      </div>
      <div
        className="font-display text-[44px] font-light leading-none"
        style={{ color: 'var(--gold)' }}
      >
        {value}
      </div>
      <p
        className="font-sans text-[12px] font-medium uppercase tracking-[0.06em] mt-1.5"
        style={{ color: 'var(--text-3)' }}
      >
        {label}
      </p>
      {sub != null && (
        <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
