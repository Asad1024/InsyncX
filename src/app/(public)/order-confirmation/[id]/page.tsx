import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import { ClearCartOnMount } from '@/components/storefront/ClearCartOnMount';
import { Check, Package, ArrowRight } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { stripeSessionId: id }],
      userId: session.user.id,
    },
    include: {
      orderItems: { include: { product: true } },
      store: true,
    },
  });
  if (!order) notFound();

  const shortId = order.id.slice(-8).toUpperCase();
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discount);
  const total = Number(order.total);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <ClearCartOnMount />
      {/* Header */}
      <div
        className="py-8 px-6 md:px-12 border-b"
        style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2"
            style={{ borderColor: 'var(--line-gold)', background: 'var(--gold-bg)' }}
          >
            <Check className="w-8 h-8 text-[var(--gold)]" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-[36px] md:text-[44px] font-light text-[var(--text)] mb-2">
            Order confirmed
          </h1>
          <p className="font-sans text-[14px] text-[var(--text-3)]">
            Order <span className="font-medium text-[var(--text-2)]">#{shortId}</span>
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-12 px-4 md:px-6">
        {/* Order summary card */}
        <div
          className="rounded-[14px] border p-6 md:p-8 mb-8"
          style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-[var(--text-4)]" />
            <h2 className="font-display text-[20px] font-normal text-[var(--text)]">Order summary</h2>
          </div>
          <ul className="space-y-4 mb-6">
            {order.orderItems.map((oi) => {
              const img = getFirstProductImage(oi.product.images);
              return (
                <li key={oi.id} className="flex gap-4">
                  <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-[var(--surface3)]">
                    {img ? (
                      <Image src={img} alt={oi.product.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full bg-[var(--surface3)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[14px] text-[var(--text)]">{oi.product.title}</p>
                    <p className="font-sans text-[12px] text-[var(--text-4)]">Qty: {oi.quantity}</p>
                  </div>
                  <p className="font-sans text-[14px] font-medium text-[var(--gold)] shrink-0">
                    {formatPrice(Number(oi.price) * oi.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--line)' }}>
            <div className="flex justify-between font-sans text-[14px] text-[var(--text-3)]">
              <span>Subtotal</span>
              <span className="text-[var(--text)]">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && order.couponCode && (
              <div className="flex justify-between font-sans text-[14px] text-[var(--text-3)]">
                <span>Discount ({order.couponCode})</span>
                <span className="text-[var(--green)]">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-sans text-[14px] font-medium text-[var(--text-2)]">Total</span>
              <span className="font-display text-[22px] font-light text-[var(--gold)]">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-2 font-sans text-[13px] font-semibold uppercase tracking-wider px-6 py-3 rounded-[10px] border transition-colors"
            style={{ borderColor: 'var(--line-gold)', color: 'var(--gold)', background: 'var(--gold-bg)' }}
          >
            View order <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-sans text-[13px] font-semibold uppercase tracking-[0.2em] px-8 py-3 rounded-[10px] bg-[var(--gold)] text-white hover:opacity-90 transition-opacity"
          >
            Continue shopping
          </Link>
        </div>
        <p className="font-sans text-[12px] text-[var(--text-4)] text-center">
          A confirmation email has been sent to {session.user.email ?? 'you'}.
        </p>
      </div>
    </div>
  );
}
