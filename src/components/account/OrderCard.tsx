import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import type { OrderStatus } from '@prisma/client';
import { cn } from '@/lib/utils';

type OrderItemThumb = {
  product: { images: unknown };
};

interface OrderCardProps {
  order: {
    id: string;
    createdAt: Date;
    status: OrderStatus;
    total: unknown;
    store: { name: string };
    orderItems?: Array<OrderItemThumb & { quantity: number }>;
  };
  /** Single-row layout for dashboard */
  variant?: 'default' | 'compact';
}

export function OrderCard({ order, variant = 'default' }: OrderCardProps) {
  const items = order.orderItems ?? [];
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const thumbs = items.slice(0, 3);
  const extra = items.length > 3 ? items.length - 3 : 0;
  const images = thumbs.map((oi) => getFirstProductImage(oi.product?.images));
  const compact = variant === 'compact';

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className={cn(
        'group block rounded-2xl border border-white/10 bg-[rgba(4,14,32,0.42)] no-underline shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-[16px] transition-all duration-300 ease-out',
        'hover:border-[rgba(29,110,255,0.38)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4),0_0_36px_rgba(29,110,255,0.14)]',
        compact ? 'px-4 py-3.5 md:px-5 md:py-4' : 'overflow-hidden'
      )}
      style={{ WebkitBackdropFilter: 'blur(16px)' }}
    >
      {compact ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <div className="flex gap-1.5">
              {images.length > 0
                ? images.map((src, i) =>
                    src ? (
                      <div
                        key={i}
                        className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[var(--surface3)]"
                      >
                        <Image
                          src={src}
                          alt=""
                          width={44}
                          height={44}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div key={i} className="h-11 w-11 shrink-0 rounded-xl bg-[var(--surface3)]" />
                    )
                  )
                : (
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--surface3)]" />
                )}
              {extra > 0 && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[rgba(29,110,255,0.08)] font-sans text-[11px] font-semibold text-[var(--muted)]">
                  +{extra}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[13px] font-semibold tabular-nums text-[var(--cyan)]">
                  #INS-{order.id.slice(-8).toUpperCase()}
                </span>
                <span className="font-sans text-[12px] text-[var(--muted)]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-0.5 font-sans text-[11px] text-[var(--muted)]">
                {itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''}` : '—'} · {order.store.name}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-3 sm:justify-end sm:gap-4">
            <StatusBadge status={order.status} withDot />
            <div className="text-right">
              <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Total
              </p>
              <p className="font-display text-[22px] font-bold leading-tight text-[var(--white)]">
                {formatPrice(Number(order.total))}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--cyan)]" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <span className="font-display text-[14px] font-semibold tabular-nums text-[var(--cyan)]">
                #INS-{order.id.slice(-8).toUpperCase()}
              </span>
              <span className="hidden h-1 w-1 shrink-0 rounded-full bg-[var(--muted)] sm:block" aria-hidden />
              <span className="font-sans text-[13px] text-[var(--muted)]">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={order.status} withDot />
              <span className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-[var(--muted)] transition-colors group-hover:text-[var(--cyan)]">
                Details
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 px-5 py-5 md:px-6">
            <div>
              <div className="flex gap-2">
                {images.length > 0
                  ? images.map((src, i) =>
                      src ? (
                        <div
                          key={i}
                          className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[var(--surface3)]"
                        >
                          <Image
                            src={src}
                            alt=""
                            width={48}
                            height={48}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div key={i} className="h-12 w-12 shrink-0 rounded-xl bg-[var(--surface3)]" />
                      )
                    )
                  : (
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-[var(--surface3)]" />
                  )}
                {extra > 0 && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[rgba(29,110,255,0.08)] font-sans text-[12px] font-medium text-[var(--muted)]">
                    +{extra}
                  </div>
                )}
              </div>
              <p className="mt-2 font-sans text-[12px] text-[var(--muted)]">
                {itemCount > 0 ? `${itemCount} item(s)` : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Total
              </p>
              <p className="font-display text-[28px] font-bold text-[var(--white)]">
                {formatPrice(Number(order.total))}
              </p>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
