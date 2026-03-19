import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import type { OrderStatus } from '@prisma/client';

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
}

export function OrderCard({ order }: OrderCardProps) {
  const items = order.orderItems ?? [];
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const thumbs = items.slice(0, 3);
  const extra = items.length > 3 ? items.length - 3 : 0;
  const images = thumbs.map((oi) => {
    const imgs = Array.isArray(oi.product?.images) ? oi.product.images as string[] : [];
    return imgs[0] ?? null;
  });

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between py-5 px-6 border-b"
        style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-4">
          <span
            className="font-sans text-[14px] font-semibold font-[tabular-nums]"
            style={{ color: 'var(--gold)' }}
          >
            #INS-{order.id.slice(-8).toUpperCase()}
          </span>
          <span
            className="w-1 h-1 rounded-full shrink-0"
            style={{ background: 'var(--text-4)' }}
          />
          <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium transition-colors"
            style={{ color: 'var(--text-3)' }}
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-between gap-6 py-5 px-6">
        <div>
          <div className="flex gap-2">
            {images.length > 0
              ? images.map((src, i) =>
                  src ? (
                    <div
                      key={i}
                      className="w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--surface3)]"
                    >
                      <Image
                        src={src}
                        alt=""
                        width={40}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="w-10 h-12 rounded-lg bg-[var(--surface3)] shrink-0"
                    />
                  )
                )
              : (
                <div className="w-10 h-12 rounded-lg bg-[var(--surface3)] shrink-0" />
              )}
            {extra > 0 && (
              <div
                className="w-10 h-12 rounded-lg border flex items-center justify-center shrink-0 font-sans text-[12px] font-medium"
                style={{ background: 'var(--surface3)', borderColor: 'var(--line)', color: 'var(--text-3)' }}
              >
                +{extra}
              </div>
            )}
          </div>
          <p className="font-sans text-[12px] mt-2" style={{ color: 'var(--text-3)' }}>
            {itemCount > 0 ? `${itemCount} item(s)` : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-sans text-[11px] uppercase" style={{ color: 'var(--text-4)' }}>
            Total
          </p>
          <p className="font-display text-[28px] font-light" style={{ color: 'var(--text)' }}>
            {formatPrice(Number(order.total))}
          </p>
        </div>
      </div>
    </div>
  );
}
