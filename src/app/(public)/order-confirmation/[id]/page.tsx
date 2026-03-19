import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ClearCartOnMount } from '@/components/storefront/ClearCartOnMount';

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

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center py-24 px-4">
      <ClearCartOnMount />
      <div className="w-20 h-20 flex items-center justify-center border-2 border-[#c9a96e] mb-8" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
        <svg className="w-10 h-10 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-display text-[48px] font-light text-[#f0ede6] mb-2">Order Confirmed!</h1>
      <p className="font-sans text-[14px] text-[#888880] mb-12">Order #{shortId}</p>

      <div className="w-full max-w-md p-8 bg-[#111] border text-left mb-10" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <ul className="space-y-3 mb-6">
          {order.orderItems.map((oi) => (
            <li key={oi.id} className="flex justify-between font-sans text-[14px]">
              <span className="text-[#f0ede6]">{oi.product.title} × {oi.quantity}</span>
              <span className="text-[#c9a96e]">{formatPrice(Number(oi.price) * oi.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t py-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between font-sans text-[14px]">
            <span className="text-[#888880]">Total</span>
            <span className="font-display text-[24px] font-light text-[#c9a96e]">{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <Link
          href={`/account/orders/${order.id}`}
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] px-6 py-3 border text-[#c9a96e] hover:bg-[#1a1a1a] transition-colors"
          style={{ borderColor: 'rgba(201,169,110,0.25)' }}
        >
          Track Order
        </Link>
        <Link
          href="/shop"
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] px-6 py-3 bg-[#c9a96e] text-[#080808] hover:bg-[#e8c98a] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
      <p className="font-sans text-[12px] text-[#444440]">A confirmation email has been sent.</p>
    </div>
  );
}
