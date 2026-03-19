'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/actions/order.actions';
import type { OrderStatus } from '@prisma/client';
import { Check } from 'lucide-react';

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
};

type Actor = 'vendor' | 'admin';

export function UpdateOrderStatus({
  orderId,
  currentStatus,
  actor = 'vendor',
}: {
  orderId: string;
  currentStatus: OrderStatus;
  actor?: Actor;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const next = nextStatus[currentStatus];
  if (!next) return null;

  const label = next.replace('_', ' ');
  const handleUpdate = async () => {
    setLoading(true);
    await updateOrderStatus(orderId, next, actor);
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleUpdate}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2.5 font-sans text-[15px] font-semibold uppercase tracking-[0.08em] px-8 py-4 rounded-[12px] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: 'var(--gold)',
        color: '#000',
        boxShadow: '0 4px 14px rgba(212,168,67,0.35)',
      }}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : (
        <Check className="w-5 h-5" strokeWidth={2.5} />
      )}
      Mark as {label}
    </button>
  );
}
