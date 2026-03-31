import { cn } from '@/lib/utils';
import type { OrderStatus } from '@prisma/client';

const statusStyles: Record<OrderStatus, { bg: string; color: string }> = {
  PENDING: { bg: 'var(--amber-bg)', color: 'var(--amber)' },
  CONFIRMED: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
  SHIPPED: { bg: 'rgba(139, 92, 246, 0.12)', color: 'rgb(167, 139, 250)' },
  DELIVERED: { bg: 'var(--green-bg)', color: 'var(--green)' },
  CANCELLED: { bg: 'var(--red-bg)', color: 'var(--red)' },
  RETURN_REQUESTED: { bg: 'rgba(245, 158, 11, 0.15)', color: 'rgb(245, 158, 11)' },
  RETURN_APPROVED: { bg: 'rgba(59, 130, 246, 0.16)', color: 'rgb(96, 165, 250)' },
  RETURN_REJECTED: { bg: 'rgba(239, 68, 68, 0.14)', color: 'rgb(248, 113, 113)' },
  RETURNED: { bg: 'rgba(34, 197, 94, 0.14)', color: 'rgb(74, 222, 128)' },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const style = statusStyles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.06em]',
        className
      )}
      style={{
        background: style.bg,
        color: style.color,
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
