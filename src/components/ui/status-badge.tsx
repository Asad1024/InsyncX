import { cn } from '@/lib/utils';
import type { OrderStatus } from '@prisma/client';

const statusStyles: Record<
  OrderStatus,
  { bg: string; border: string; color: string; dot: string; dotGlow?: string }
> = {
  PENDING: {
    bg: 'rgba(255,160,0,0.1)',
    border: '1px solid rgba(255,160,0,0.25)',
    color: '#ffb300',
    dot: '#ffb300',
    dotGlow: 'rgba(255,179,0,0.55)',
  },
  CONFIRMED: {
    bg: 'rgba(29,110,255,0.1)',
    border: '1px solid var(--border)',
    color: 'var(--cyan)',
    dot: 'var(--cyan)',
    dotGlow: 'rgba(0,200,255,0.45)',
  },
  SHIPPED: {
    bg: 'rgba(0,200,100,0.1)',
    border: '1px solid rgba(0,200,100,0.25)',
    color: '#00e676',
    dot: '#00e676',
    dotGlow: 'rgba(0,230,118,0.55)',
  },
  DELIVERED: {
    bg: 'rgba(0,200,100,0.1)',
    border: '1px solid rgba(0,200,100,0.25)',
    color: '#00e676',
    dot: '#22c55e',
    dotGlow: 'rgba(34,197,94,0.5)',
  },
  CANCELLED: {
    bg: 'rgba(255,77,77,0.1)',
    border: '1px solid rgba(255,77,77,0.2)',
    color: '#ff6b6b',
    dot: '#ff6b6b',
    dotGlow: 'rgba(255,107,107,0.45)',
  },
  RETURN_REQUESTED: {
    bg: 'rgba(255,160,0,0.1)',
    border: '1px solid rgba(255,160,0,0.25)',
    color: '#ffb300',
    dot: '#ffb300',
    dotGlow: 'rgba(255,179,0,0.5)',
  },
  RETURN_APPROVED: {
    bg: 'rgba(29,110,255,0.1)',
    border: '1px solid var(--border)',
    color: 'var(--cyan)',
    dot: 'var(--cyan)',
    dotGlow: 'rgba(0,200,255,0.45)',
  },
  RETURN_REJECTED: {
    bg: 'rgba(255,77,77,0.1)',
    border: '1px solid rgba(255,77,77,0.2)',
    color: '#ff6b6b',
    dot: '#ff6b6b',
    dotGlow: 'rgba(255,107,107,0.45)',
  },
  RETURNED: {
    bg: 'rgba(0,200,100,0.08)',
    border: '1px solid rgba(0,200,100,0.2)',
    color: '#4ade80',
    dot: '#4ade80',
    dotGlow: 'rgba(74,222,128,0.45)',
  },
};

export function StatusBadge({
  status,
  className,
  withDot,
}: {
  status: OrderStatus;
  className?: string;
  /** Glowing status dot (e.g. shipped = green pulse) */
  withDot?: boolean;
}) {
  const style = statusStyles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em]',
        className
      )}
      style={{
        background: style.bg,
        border: style.border,
        color: style.color,
      }}
    >
      {withDot && (
        <span
          className="relative flex h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: style.dot, boxShadow: `0 0 10px ${style.dotGlow ?? style.dot}` }}
          aria-hidden
        >
          {(status === 'SHIPPED' || status === 'DELIVERED') && (
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-35"
              style={{ backgroundColor: style.dot }}
            />
          )}
        </span>
      )}
      {status.replace('_', ' ')}
    </span>
  );
}
