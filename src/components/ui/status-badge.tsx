import { cn } from '@/lib/utils';
import type { OrderStatus } from '@prisma/client';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  SHIPPED: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block border px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider',
        statusColors[status],
        className
      )}
    >
      {status}
    </span>
  );
}
