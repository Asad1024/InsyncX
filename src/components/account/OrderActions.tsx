'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '@prisma/client';
import { updateOrderStatus } from '@/actions/order.actions';
import { useToast } from '@/hooks/use-toast';

export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const canCancel = status === 'PENDING' || status === 'CONFIRMED';
  const canRequestReturn = status === 'DELIVERED';

  if (!canCancel && !canRequestReturn) return null;

  const onAction = async (nextStatus: OrderStatus, confirmText: string, successText: string) => {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    const res = await updateOrderStatus(orderId, nextStatus, 'customer');
    if (res?.error) toast({ title: res.error, variant: 'error' });
    else {
      toast({ title: successText, variant: 'success' });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="card card-p">
      <h2 className="font-display text-[20px] font-normal" style={{ color: 'var(--text)' }}>
        Order actions
      </h2>
      <p className="font-sans text-[13px] mt-1 mb-4" style={{ color: 'var(--text-3)' }}>
        Manage cancellation and return requests from here.
      </p>
      <div className="flex flex-wrap gap-3">
        {canCancel ? (
          <button
            type="button"
            onClick={() => onAction('CANCELLED', 'Cancel this order?', 'Order cancelled')}
            disabled={loading}
            className="btn btn-ghost btn-sm border border-[var(--line)] hover:border-[var(--red)] hover:text-[var(--red)] disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Cancel order'}
          </button>
        ) : null}
        {canRequestReturn ? (
          <button
            type="button"
            onClick={() => onAction('RETURN_REQUESTED', 'Request return for this delivered order?', 'Return requested')}
            disabled={loading}
            className="btn btn-ghost btn-sm border border-[var(--line)] hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Request return'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
