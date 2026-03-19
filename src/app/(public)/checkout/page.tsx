'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice } from '@/lib/utils';
import { createCheckoutSession, createOrderCashOnDelivery } from '@/actions/checkout.actions';
import { updateCartItemDb, removeFromCartDb } from '@/actions/cart.actions';
import { getCheckoutPrefill, saveDefaultAddress } from '@/actions/user.actions';
import { applyCoupon } from '@/actions/coupon.actions';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { filterCartItemsByStoreSlug, getStoreSubtotal } from '@/lib/cart-utils';
import {
  ChevronRight,
  Minus,
  Plus,
  Tag,
  X,
} from 'lucide-react';

function CheckoutPageContent() {
  const displaySettings = useDisplaySettings();
  const symbol = displaySettings.currencySymbol;
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeSlug = searchParams.get('store');
  const { items, updateQuantity, removeItem } = useCartStore();
  const { toast } = useToast();
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
    phone: '',
  });
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [prefillDone, setPrefillDone] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number | null;
    fixedAmount: number | null;
    eligibleProductIds: string[] | null;
  } | null>(null);

  const checkoutItems = useMemo(() => {
    if (!storeSlug) return [];
    return filterCartItemsByStoreSlug(items, storeSlug);
  }, [items, storeSlug]);

  const isCheckoutInvalid = useMemo(() => {
    if (!storeSlug?.trim()) return true;
    if (checkoutItems.length === 0) return true;
    const keys = new Set(checkoutItems.map((i) => i.storeSlug ?? '__unknown__'));
    return keys.size > 1;
  }, [storeSlug, checkoutItems]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout');
      return;
    }
    if (status !== 'authenticated') return;
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    if (isCheckoutInvalid) {
      toast({ title: 'Please select a store to checkout from your cart', variant: 'error' });
      router.replace('/cart');
    }
  }, [status, items.length, isCheckoutInvalid, router, toast]);

  useEffect(() => {
    if (status !== 'authenticated' || prefillDone) return;
    getCheckoutPrefill().then(({ phone, defaultAddress }) => {
      if (defaultAddress) {
        setAddress({
          name: defaultAddress.name ?? '',
          line1: defaultAddress.line1 ?? '',
          line2: defaultAddress.line2 ?? '',
          city: defaultAddress.city ?? '',
          state: defaultAddress.state ?? '',
          postalCode: defaultAddress.postalCode ?? '',
          country: defaultAddress.country ?? 'US',
          phone: defaultAddress.phone ?? phone ?? '',
        });
      } else if (phone) {
        setAddress((a) => ({ ...a, phone }));
      }
      setPrefillDone(true);
    });
  }, [status, prefillDone]);

  const subtotal = getStoreSubtotal(checkoutItems);
  const discountBase = useMemo(() => {
    if (!appliedCoupon?.eligibleProductIds?.length) return subtotal;
    return checkoutItems
      .filter((i) => appliedCoupon.eligibleProductIds!.includes(i.productId))
      .reduce((acc, i) => acc + (i.price ?? 0) * i.quantity, 0);
  }, [appliedCoupon, checkoutItems, subtotal]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.fixedAmount != null && appliedCoupon.fixedAmount > 0) {
      return Math.min(appliedCoupon.fixedAmount, discountBase);
    }
    const pct = appliedCoupon.discountPercent ?? 0;
    return (discountBase * pct) / 100;
  }, [appliedCoupon, discountBase]);

  const totalBeforeTax = Math.max(0, subtotal - discountAmount);
  const qualifiesForFreeShipping =
    displaySettings.freeShippingThreshold != null &&
    totalBeforeTax >= displaySettings.freeShippingThreshold;
  const shippingAmount = qualifiesForFreeShipping
    ? 0
    : (displaySettings.shippingCharge ?? 0);
  const taxAmount =
    displaySettings.taxEnabled && displaySettings.taxRatePercent != null
      ? totalBeforeTax * (displaySettings.taxRatePercent / 100)
      : 0;
  const total = totalBeforeTax + shippingAmount + taxAmount;

  const shippingPayload = {
    name: address.name,
    line1: address.line1,
    line2: address.line2 || undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone || undefined,
  };

  const handleUpdateQty = async (productId: string, delta: number) => {
    const line = items.find((i) => i.productId === productId);
    if (!line) return;
    const newQty = Math.max(0, line.quantity + delta);
    updateQuantity(productId, newQty);
    if (status === 'authenticated') await updateCartItemDb(productId, newQty);
    if (newQty === 0) toast({ title: 'Removed from order', variant: 'default' });
  };

  const handleRemoveLine = async (productId: string) => {
    removeItem(productId);
    if (status === 'authenticated') await removeFromCartDb(productId);
    toast({ title: 'Removed from order', variant: 'default' });
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    const productIds = checkoutItems.map((i) => i.productId);
    const res = await applyCoupon(couponInput.trim(), subtotal, productIds);
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
      setCouponLoading(false);
      return;
    }
    const eligible =
      'eligibleProductIds' in res && Array.isArray(res.eligibleProductIds) && res.eligibleProductIds.length > 0
        ? res.eligibleProductIds
        : null;
    setAppliedCoupon({
      code: res.code,
      discountPercent: res.fixedAmount != null ? null : (res.discount ?? 0),
      fixedAmount: res.fixedAmount ?? null,
      eligibleProductIds: eligible,
    });
    setCouponInput('');
    toast({ title: `Coupon ${res!.code} applied`, variant: 'success' });
    setCouponLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;
    setLoading(true);
    if (saveAsDefault) {
      await saveDefaultAddress(
        { ...shippingPayload, phone: shippingPayload.phone },
        address.phone || undefined
      );
    }
    const couponCode = appliedCoupon?.code ?? undefined;
    if (paymentMethod === 'cod') {
      const res = await createOrderCashOnDelivery({
        items: checkoutItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price ?? 0,
          title: i.title ?? '',
        })),
        shippingAddress: shippingPayload,
        couponCode,
        shippingAmount: shippingAmount > 0 ? shippingAmount : undefined,
        taxAmount: taxAmount > 0 ? taxAmount : undefined,
      });
      if (res?.orderId) {
        router.push(`/order-confirmation/${res.orderId}`);
        return;
      }
      if (res?.error) toast({ title: res.error, variant: 'error' });
      setLoading(false);
      return;
    }
    const res = await createCheckoutSession({
      items: checkoutItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price ?? 0,
        title: i.title ?? '',
      })),
      shippingAddress: shippingPayload,
      couponCode,
      shippingAmount: shippingAmount > 0 ? shippingAmount : undefined,
      taxAmount: taxAmount > 0 ? taxAmount : undefined,
    });
    if (res?.url) {
      window.location.href = res.url;
    } else {
      if (res?.error) toast({ title: res.error, variant: 'error' });
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[var(--surface2)] border rounded-[10px] py-3 px-4 font-sans text-[14px] text-[var(--text)] placeholder:text-[var(--text-4)] outline-none transition-all duration-150 focus:border-[var(--line-gold)] focus:shadow-[0_0_0_3px_rgba(212,168,67,0.10)]';
  const labelClass = 'font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-4)] block mb-2';

  if (
    status === 'loading' ||
    (status === 'authenticated' && items.length === 0) ||
    (status === 'authenticated' && items.length > 0 && isCheckoutInvalid)
  ) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="font-sans text-[14px] text-[var(--text-3)]">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const orderingStoreLabel = checkoutItems[0]?.storeName ?? 'Unknown Store';

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Page header */}
      <div
        className="flex items-center justify-between py-8 px-6 md:px-12 bg-[var(--surface)] border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-[var(--text-4)] mb-1">
            Ordering from: {orderingStoreLabel}
          </p>
          <h1 className="font-display font-light text-[40px] text-[var(--text)]">Checkout</h1>
        </div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-[var(--gold)] hover:underline"
        >
          Back to cart <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-4 lg:px-12 grid lg:grid-cols-[1fr_400px] gap-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact */}
          <section
            className="p-6 md:p-8 rounded-[14px] border bg-[var(--surface)]"
            style={{ borderColor: 'var(--line)' }}
          >
            <h2 className="font-display text-[20px] font-normal text-[var(--text)] mb-6">Contact</h2>
            <p className={labelClass}>Email</p>
            <p className="font-sans text-[14px] text-[var(--text)] mb-4">{session?.user?.email ?? '—'}</p>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input
                id="phone"
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
                className={inputClass}
                style={{ borderColor: 'var(--line)' }}
              />
            </div>
          </section>

          {/* Shipping address */}
          <section
            className="p-6 md:p-8 rounded-[14px] border bg-[var(--surface)]"
            style={{ borderColor: 'var(--line)' }}
          >
            <h2 className="font-display text-[20px] font-normal text-[var(--text)] mb-6">Shipping address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>Full name</label>
                <input
                  id="name"
                  value={address.name}
                  onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                  required
                  className={inputClass}
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>
              <div>
                <label htmlFor="line1" className={labelClass}>Address</label>
                <input
                  id="line1"
                  value={address.line1}
                  onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                  required
                  className={inputClass}
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>
              <div>
                <label htmlFor="line2" className={labelClass}>Apartment, suite, etc.</label>
                <input
                  id="line2"
                  value={address.line2}
                  onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                  className={inputClass}
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>City</label>
                  <input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    required
                    className={inputClass}
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>State</label>
                  <input
                    id="state"
                    value={address.state}
                    onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                    required
                    className={inputClass}
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className={labelClass}>ZIP</label>
                  <input
                    id="postalCode"
                    value={address.postalCode}
                    onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                    required
                    className={inputClass}
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>Country</label>
                  <input
                    id="country"
                    value={address.country}
                    onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                    required
                    className={inputClass}
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--line)] accent-[var(--gold)]"
                />
                <span className="font-sans text-[13px] text-[var(--text-2)]">Save as default address</span>
              </label>
            </div>
          </section>

          {/* Payment method */}
          <section
            className="p-6 md:p-8 rounded-[14px] border bg-[var(--surface)]"
            style={{ borderColor: 'var(--line)' }}
          >
            <h2 className="font-display text-[20px] font-normal text-[var(--text)] mb-4">Payment method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                  className="w-4 h-4 accent-[var(--gold)]"
                />
                <span className="font-sans text-[15px] text-[var(--text)]">Pay with card (Stripe)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-4 h-4 accent-[var(--gold)]"
                />
                <span className="font-sans text-[15px] text-[var(--text)]">Cash on Delivery (COD)</span>
              </label>
            </div>
            {paymentMethod === 'stripe' && (
              <p className="font-sans text-[13px] text-[var(--text-4)] mt-3">Payment is handled securely by Stripe.</p>
            )}
            {paymentMethod === 'cod' && (
              <p className="font-sans text-[13px] text-[var(--text-4)] mt-3">Pay when your order is delivered.</p>
            )}
          </section>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/cart"
              className="btn btn-secondary font-sans text-[13px] font-semibold uppercase tracking-wider px-6 py-3 rounded-[10px]"
              style={{
                borderColor: 'var(--line-gold)',
                color: 'var(--gold)',
                background: 'var(--gold-bg)',
              }}
            >
              Back to cart
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary font-sans text-[13px] font-semibold uppercase tracking-[0.2em] px-8 py-3 rounded-[10px] bg-[var(--gold)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place order (COD)' : 'Pay with Stripe'}
            </button>
          </div>
        </form>

        {/* Order summary sidebar */}
        <div className="lg:sticky lg:top-[88px] h-fit">
          <div
            className="p-6 md:p-8 rounded-[14px] border"
            style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
          >
            <h2 className="font-display text-[24px] font-normal text-[var(--text)] mb-6">Order summary</h2>
            <ul className="space-y-5 mb-6">
              {checkoutItems.map((line) => (
                <li key={line.productId} className="flex gap-3 pb-5 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--line)' }}>
                  <Link
                    href={line.slug ? `/product/${line.slug}` : '/shop'}
                    className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-[var(--surface3)] block"
                  >
                    {line.image ? (
                      <Image src={line.image} alt={line.title ?? ''} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full bg-[var(--surface3)]" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={line.slug ? `/product/${line.slug}` : '/shop'}
                      className="font-sans text-[13px] text-[var(--text)] hover:text-[var(--gold)] transition-colors line-clamp-2"
                    >
                      {line.title}
                    </Link>
                    {line.storeName ? (
                      line.storeSlug ? (
                        <Link
                          href={`/store/${line.storeSlug}`}
                          className="font-sans text-[11px] text-[var(--text-4)] hover:text-[var(--gold)] mt-0.5 block truncate"
                        >
                          {line.storeName}
                        </Link>
                      ) : (
                        <p className="font-sans text-[11px] text-[var(--text-4)] mt-0.5 truncate">{line.storeName}</p>
                      )
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="flex items-center rounded-md border" style={{ borderColor: 'var(--line)' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(line.productId, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text)] hover:bg-[var(--surface2)] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-sans text-[12px] text-[var(--text)]">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(line.productId, 1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text)] hover:bg-[var(--surface2)] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.productId)}
                        className="inline-flex items-center gap-1 font-sans text-[11px] text-[var(--text-4)] hover:text-[var(--red)] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-sans text-[13px] font-medium text-[var(--gold)] shrink-0 self-start pt-0.5">
                    {formatPrice((line.price ?? 0) * line.quantity, symbol)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Coupon */}
            <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--line)' }}>
              {appliedCoupon ? (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg border" style={{ background: 'var(--gold-bg)', borderColor: 'var(--line-gold)' }}>
                  <span className="font-sans text-[13px] text-[var(--gold)]">{appliedCoupon.code} applied</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="font-sans text-[11px] font-medium uppercase text-[var(--text-4)] hover:text-[var(--red)]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-4)]" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      className={`${inputClass} pl-10`}
                      style={{ borderColor: 'var(--line)' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="font-sans text-[11px] font-semibold uppercase tracking-wider px-4 py-3 rounded-[10px] border transition-colors disabled:opacity-50"
                    style={{ borderColor: 'var(--line-gold)', color: 'var(--gold)', background: 'var(--gold-bg)' }}
                  >
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-sans text-[14px] text-[var(--text-3)]">
                <span>Subtotal</span>
                <span className="text-[var(--text)]">{formatPrice(subtotal, symbol)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between font-sans text-[14px] text-[var(--green)]">
                  <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
                  <span>-{formatPrice(discountAmount, symbol)}</span>
                </div>
              )}
              {shippingAmount > 0 && (
                <div className="flex justify-between font-sans text-[14px] text-[var(--text-3)]">
                  <span>Shipping</span>
                  <span className="text-[var(--text)]">{formatPrice(shippingAmount, symbol)}</span>
                </div>
              )}
              {shippingAmount === 0 && displaySettings.freeShippingThreshold != null && totalBeforeTax >= displaySettings.freeShippingThreshold && (
                <div className="flex justify-between font-sans text-[14px] text-[var(--green)]">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between font-sans text-[14px] text-[var(--text-3)]">
                  <span>Tax ({displaySettings.taxRatePercent}%)</span>
                  <span className="text-[var(--text)]">{formatPrice(taxAmount, symbol)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-baseline mt-6 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
              <span className="font-sans text-[14px] font-medium text-[var(--text-3)]">Total</span>
              <span className="font-display text-[24px] font-light text-[var(--gold)]">{formatPrice(total, symbol)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
          <p className="font-sans text-[14px] text-[var(--text-3)]">Loading...</p>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
