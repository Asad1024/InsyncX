import { getOrderById } from '@/actions/order.actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Breadcrumb } from '@/components/storefront/Breadcrumb';
import { OrderStatusStepper } from '@/components/account/OrderStatusStepper';
import { MapPin, Tag } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const orderNum = `#INS-${order.id.slice(-8).toUpperCase()}`;
  const address =
    typeof order.shippingAddress === 'object' && order.shippingAddress !== null
      ? (order.shippingAddress as Record<string, unknown>)
      : null;

  return (
    <div className="py-10 px-12" style={{ padding: '40px 48px' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Orders', href: '/account/orders' },
          { label: orderNum },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1
            className="font-display text-[40px] font-light"
            style={{ color: 'var(--text)' }}
          >
            Order {orderNum}
          </h1>
          <p className="font-sans text-[13px] mt-1.5" style={{ color: 'var(--text-3)' }}>
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge
          status={order.status}
          className="!px-5 !py-2"
        />
      </div>

      <div className="mb-8">
        <OrderStatusStepper currentStatus={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[60%_1fr]">
        <div className="card overflow-hidden min-w-0">
          <div
            className="py-5 px-6 border-b"
            style={{ borderColor: 'var(--line)' }}
          >
            <h2 className="font-display text-[22px] font-normal" style={{ color: 'var(--text)' }}>
              Order Items
            </h2>
            <p className="font-sans text-[13px] mt-0" style={{ color: 'var(--text-3)' }}>
              {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          {order.orderItems.map((oi) => {
            const img = getFirstProductImage(oi.product.images);
            const category = (oi.product as { category?: { name: string } }).category;
            return (
              <div
                key={oi.id}
                className="flex gap-4 items-center py-5 px-6 border-b"
                style={{ borderColor: 'var(--line)' }}
              >
                <div
                  className="w-16 h-20 rounded-[10px] overflow-hidden shrink-0 bg-[var(--surface3)]"
                >
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      width={64}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  {category?.name && (
                    <p
                      className="font-sans text-[10px] uppercase"
                      style={{ color: 'var(--gold)' }}
                    >
                      {category.name}
                    </p>
                  )}
                  <p className="font-display text-[18px] my-1" style={{ color: 'var(--text)' }}>
                    {oi.product.title}
                  </p>
                  <p className="font-sans text-[12px]" style={{ color: 'var(--text-3)' }}>
                    {order.store.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>
                    Qty: {oi.quantity}
                  </p>
                  <p className="font-sans text-[15px] font-semibold mt-1" style={{ color: 'var(--text)' }}>
                    {formatPrice(Number(oi.price) * oi.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-5">
          <div className="card card-p">
            <h2 className="font-display text-[22px] font-normal mb-5" style={{ color: 'var(--text)' }}>
              Summary
            </h2>
            <div className="flex justify-between py-2.5 border-b" style={{ borderColor: 'var(--line)' }}>
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Subtotal</span>
              <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text)' }}>
                {formatPrice(Number(order.subtotal))}
              </span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between py-2.5 border-b" style={{ borderColor: 'var(--line)' }}>
                <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Discount</span>
                <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--green)' }}>
                  -{formatPrice(Number(order.discount))}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2.5 border-b" style={{ borderColor: 'var(--line)' }}>
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Shipping</span>
              <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text)' }}>
                —
              </span>
            </div>
            <div className="flex justify-between py-2.5 pt-3">
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Total</span>
              <span className="font-display text-[24px] font-normal" style={{ color: 'var(--text)' }}>
                {formatPrice(Number(order.total))}
              </span>
            </div>
            {order.couponCode && (
              <div
                className="flex items-center gap-2 mt-3 rounded-lg py-2.5 px-3"
                style={{ background: 'var(--green-bg)' }}
              >
                <Tag className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--green)' }} />
                <span className="font-sans text-[12px]" style={{ color: 'var(--green)' }}>
                  {order.couponCode} applied
                </span>
              </div>
            )}
          </div>

          {order.user && (
            <div className="card card-p">
              <h2 className="font-display text-[22px] font-normal mb-4" style={{ color: 'var(--text)' }}>
                Contact
              </h2>
              <div className="font-sans text-[13px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
                <p className="font-medium" style={{ color: 'var(--text)' }}>{order.user.name ?? '—'}</p>
                {order.user.email && <p className="mt-0.5">{order.user.email}</p>}
                {(order.user as { phone?: string }).phone && (
                  <p className="mt-0.5">{(order.user as { phone?: string }).phone}</p>
                )}
              </div>
            </div>
          )}

          {address && (
            <div className="card card-p">
              <h2 className="font-display text-[22px] font-normal mb-4" style={{ color: 'var(--text)' }}>
                Shipping To
              </h2>
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                <div className="font-sans text-[13px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  {typeof address.name === 'string' && address.name ? (
                    <p className="font-sans text-[14px] font-medium mb-0.5" style={{ color: 'var(--text)' }}>
                      {address.name}
                    </p>
                  ) : null}
                  {[
                    address.line1,
                    address.line2,
                    [address.city, address.state, (address as Record<string, unknown>).postalCode ?? (address as Record<string, unknown>).zip].filter(Boolean).join(', '),
                  ]
                    .filter(Boolean)
                    .map((line, i) => (
                      <p key={i} className="m-0">
                        {String(line)}
                      </p>
                    ))}
                  {typeof (address as Record<string, unknown>).phone === 'string' &&
                  (address as Record<string, unknown>).phone ? (
                    <p className="mt-2 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>
                      Phone: {(address as Record<string, string>).phone}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="card card-p text-center">
            <h2 className="font-display text-[20px] font-normal" style={{ color: 'var(--text)' }}>
              Need Help?
            </h2>
            <p className="font-sans text-[13px] my-2" style={{ color: 'var(--text-3)' }}>
              Contact us if you have questions about your order.
            </p>
            <Link href="/contact" className="btn btn-ghost btn-sm btn-full mt-4">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
