import { auth } from '@/lib/auth';
import { getOrderById } from '@/actions/order.actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Breadcrumb } from '@/components/storefront/Breadcrumb';
import { OrderStatusStepper } from '@/components/account/OrderStatusStepper';
import { UpdateOrderStatus } from '@/components/vendor/UpdateOrderStatus';

interface Props { params: Promise<{ id: string }> }

export default async function VendorOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;
  const order = await getOrderById(id);
  if (!order) notFound();
  if (order.store.ownerId !== session.user.id && session.user.role !== 'ADMIN') notFound();

  const orderNum = `#INS-${order.id.slice(-8).toUpperCase()}`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Orders', href: '/vendor/orders' },
          { label: orderNum },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[40px] font-light" style={{ color: 'var(--text)' }}>
            Order {orderNum}
          </h1>
          <p className="font-sans text-[13px] mt-1.5" style={{ color: 'var(--text-3)' }}>
            {order.user.name} · {order.user.email}
          </p>
        </div>
        <StatusBadge status={order.status} className="!px-5 !py-2" />
      </div>
      <div className="mb-8">
        <OrderStatusStepper currentStatus={order.status} />
      </div>
      <div className="grid gap-8 lg:grid-cols-[60%_1fr]">
        <div className="card overflow-hidden">
          <div className="py-5 px-6 border-b" style={{ borderColor: 'var(--line)' }}>
            <h2 className="font-display text-[22px] font-normal" style={{ color: 'var(--text)' }}>Order Items</h2>
            <p className="font-sans text-[13px] mt-0" style={{ color: 'var(--text-3)' }}>{order.orderItems.length} item(s)</p>
          </div>
          {order.orderItems.map((oi) => {
            const imgs = Array.isArray(oi.product.images) ? (oi.product.images as string[]) : [];
            const img = imgs[0];
            return (
              <div key={oi.id} className="flex gap-4 items-center py-5 px-6 border-b" style={{ borderColor: 'var(--line)' }}>
                <div className="w-16 h-20 rounded-[10px] overflow-hidden shrink-0 bg-[var(--surface3)]">
                  {img ? <Image src={img} alt="" width={64} height={80} className="object-cover w-full h-full" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[18px]" style={{ color: 'var(--text)' }}>{oi.product.title}</p>
                  <p className="font-sans text-[12px]" style={{ color: 'var(--text-3)' }}>{order.store.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>Qty: {oi.quantity}</p>
                  <p className="font-sans text-[15px] font-semibold mt-1" style={{ color: 'var(--text)' }}>{formatPrice(Number(oi.price) * oi.quantity)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-5">
          <div className="card card-p">
            <h2 className="font-display text-[22px] font-normal mb-4" style={{ color: 'var(--text)' }}>Summary</h2>
            <div className="flex justify-between py-2.5 border-b" style={{ borderColor: 'var(--line)' }}>
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Subtotal</span>
              <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text)' }}>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between py-2.5 pt-3">
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Total</span>
              <span className="font-display text-[24px] font-normal" style={{ color: 'var(--text)' }}>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
          <div className="card card-p">
            <h2 className="font-display text-[22px] font-normal mb-4" style={{ color: 'var(--text)' }}>Update Status</h2>
            <div className="mb-5">
              <StatusBadge status={order.status} />
            </div>
            <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
