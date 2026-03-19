'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from '@/actions/order.actions';
import type { OrderStatus } from '@prisma/client';

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
  const next = nextStatus[currentStatus];
  if (!next) return null;

  const handleUpdate = async () => {
    await updateOrderStatus(orderId, next, actor);
    router.refresh();
  };

  return (
    <Button onClick={handleUpdate}>Mark as {next.replace('_', ' ')}</Button>
  );
}
