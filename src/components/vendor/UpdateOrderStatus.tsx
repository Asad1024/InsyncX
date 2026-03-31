'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/actions/order.actions';
import type { OrderStatus } from '@prisma/client';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURN_REJECTED'],
  RETURN_APPROVED: ['RETURNED'],
  RETURN_REJECTED: [],
  RETURNED: [],
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OrderStatus | ''>('');
  const options = transitions[currentStatus];
  if (!options.length) return null;

  const handleUpdate = async () => {
    if (!selected) return;
    setLoading(true);
    const res = await updateOrderStatus(orderId, selected, actor);
    if (res?.error) toast({ title: res.error, variant: 'error' });
    else {
      toast({ title: `Order marked as ${selected.replace('_', ' ')}`, variant: 'success' });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as OrderStatus)}
        className="input h-[46px] min-w-[220px]"
        disabled={loading}
      >
        <option value="">Select next status</option>
        {options.map((status) => (
          <option key={status} value={status}>
            {status.replace('_', ' ')}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading || !selected}
        className="inline-flex items-center justify-center gap-2.5 font-sans text-[14px] font-semibold uppercase tracking-[0.08em] px-6 py-3 rounded-[12px] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: 'var(--gold)',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(74,144,226,0.35)',
        }}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Check className="w-4 h-4" strokeWidth={2.5} />
        )}
        Update
      </button>
    </div>
  );
}
