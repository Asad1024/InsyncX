'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { createCheckoutSession, createOrderCashOnDelivery } from '@/actions/checkout.actions';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();
  useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [address, setAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout');
      return;
    }
    if (items.length === 0 && status === 'authenticated') {
      router.push('/cart');
    }
  }, [status, items.length, router]);

  const subtotal = getSubtotal();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    if (paymentMethod === 'cod') {
      const res = await createOrderCashOnDelivery({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price ?? 0,
          title: i.title ?? '',
        })),
        shippingAddress: address,
      });
      if (res?.orderId) {
        router.push(`/order-confirmation/${res.orderId}`);
        return;
      }
      setLoading(false);
      return;
    }
    const res = await createCheckoutSession({
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price ?? 0,
        title: i.title ?? '',
      })),
      shippingAddress: address,
    });
    if (res?.url) {
      window.location.href = res.url;
    } else {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-transparent border-0 border-b py-3 px-0 font-sans text-[14px] text-[#f0ede6] placeholder:text-[#444440] focus:outline-none focus:border-[#c9a96e] transition-colors';
  const inputBorder = { borderBottomWidth: '1px', borderBottomColor: 'rgba(201,169,110,0.3)' };
  const labelClass = 'font-sans text-[10px] uppercase tracking-[0.15em] text-[#888880] block mb-2';

  if (status === 'loading' || (status === 'authenticated' && items.length === 0)) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="font-sans text-[14px] text-[#888880]">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-[#080808] py-10 px-4 lg:px-16">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[60%_40%] gap-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          <h1 className="font-display text-[40px] font-light text-[#f0ede6] mb-8">Checkout</h1>

          <div className="p-8 bg-[#111] border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h2 className="font-display text-[20px] font-light text-[#f0ede6] mb-6">Contact</h2>
            <p className={labelClass}>Email</p>
            <p className="font-sans text-[14px] text-[#f0ede6]">{session?.user?.email ?? '—'}</p>
          </div>

          <div className="p-8 bg-[#111] border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h2 className="font-display text-[20px] font-light text-[#f0ede6] mb-6">Shipping address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>Full name</label>
                <input id="name" value={address.name} onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))} required className={inputClass} style={inputBorder} />
              </div>
              <div>
                <label htmlFor="line1" className={labelClass}>Address</label>
                <input id="line1" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} required className={inputClass} style={inputBorder} />
              </div>
              <div>
                <label htmlFor="line2" className={labelClass}>Apartment, suite, etc.</label>
                <input id="line2" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} className={inputClass} style={inputBorder} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>City</label>
                  <input id="city" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} required className={inputClass} style={inputBorder} />
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>State</label>
                  <input id="state" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} required className={inputClass} style={inputBorder} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className={labelClass}>ZIP</label>
                  <input id="postalCode" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} required className={inputClass} style={inputBorder} />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>Country</label>
                  <input id="country" value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} required className={inputClass} style={inputBorder} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-[#111] border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h2 className="font-display text-[20px] font-light text-[#f0ede6] mb-4">Payment method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="payment" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="w-4 h-4 accent-[#c9a96e]" />
                <span className="font-sans text-[15px] text-[#f0ede6]">Pay with card (Stripe)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 accent-[#c9a96e]" />
                <span className="font-sans text-[15px] text-[#f0ede6]">Cash on Delivery (COD)</span>
              </label>
            </div>
            {paymentMethod === 'stripe' && (
              <p className="font-sans text-[13px] text-[#888880] mt-3">Payment is handled securely by Stripe.</p>
            )}
            {paymentMethod === 'cod' && (
              <p className="font-sans text-[13px] text-[#888880] mt-3">Pay when your order is delivered.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/cart" className="font-sans text-[13px] font-semibold uppercase tracking-wider px-6 py-3 border text-[#c9a96e] hover:bg-[#1a1a1a] transition-colors" style={{ borderColor: 'rgba(201,169,110,0.25)' }}>
              Back to cart
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="font-sans text-[13px] font-semibold uppercase tracking-[0.2em] px-8 py-3 bg-[#c9a96e] text-[#080808] hover:bg-[#e8c98a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place order (COD)' : 'Pay with Stripe'}
            </button>
          </div>
        </form>

        <div className="lg:sticky lg:top-[100px] h-fit">
          <div className="p-8 bg-[#111] border" style={{ borderColor: 'rgba(201,169,110,0.25)' }}>
            <h2 className="font-display text-[24px] font-light text-[#f0ede6] mb-6">Order Summary</h2>
            <ul className="space-y-3 mb-6">
              {items.map((line) => (
                <li key={line.productId} className="flex gap-3">
                  <div className="relative w-14 h-14 shrink-0 bg-[#1a1a1a] overflow-hidden">
                    {line.image ? (
                      <Image src={line.image} alt={line.title ?? ''} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full bg-[#222]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[13px] text-[#f0ede6] truncate">{line.title}</p>
                    <p className="font-sans text-[11px] text-[#888880]">Qty: {line.quantity}</p>
                  </div>
                  <p className="font-sans text-[13px] text-[#c9a96e]">{formatPrice((line.price ?? 0) * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t py-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between font-sans text-[14px] text-[#888880] mb-2">
                <span>Subtotal</span>
                <span className="text-[#f0ede6]">{formatPrice(subtotal)}</span>
              </div>
              <p className="font-sans text-[12px] text-[#444440]">Shipping & tax at Stripe checkout.</p>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="font-sans text-[14px] text-[#888880]">Total</span>
              <span className="font-display text-[24px] font-light text-[#c9a96e]">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
