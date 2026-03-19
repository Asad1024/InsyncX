'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart.store';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, X, Info, ChevronRight } from 'lucide-react';
import { updateCartItemDb, removeFromCartDb } from '@/actions/cart.actions';
import { useToast } from '@/hooks/use-toast';
import { groupCartItemsByStore, getStoreSubtotal } from '@/lib/cart-utils';

export default function CartPage() {
  const { currencySymbol: symbol } = useDisplaySettings();
  useCart();
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { status } = useSession();
  const { toast } = useToast();

  const groups = groupCartItemsByStore(items);
  const storeKeys = Object.keys(groups);
  const isMultiVendor = storeKeys.length > 1;

  const handleUpdateQty = async (productId: string, delta: number) => {
    const line = items.find((i) => i.productId === productId);
    if (!line) return;
    const newQty = Math.max(0, line.quantity + delta);
    updateQuantity(productId, newQty);
    if (status === 'authenticated') await updateCartItemDb(productId, newQty);
    if (newQty === 0) toast({ title: 'Removed from cart', variant: 'default' });
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
    if (status === 'authenticated') removeFromCartDb(productId);
    toast({ title: 'Removed from cart', variant: 'default' });
  };

  const checkoutHref = (storeKey: string) => `/checkout?store=${encodeURIComponent(storeKey)}`;

  const labelClass =
    'font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-4)] block mb-4';

  const primaryBtnClass =
    'block w-full text-center font-sans text-[13px] font-semibold uppercase tracking-[0.2em] py-3 px-6 rounded-[10px] bg-[var(--gold)] text-black hover:opacity-90 transition-opacity';

  const renderLineRow = (line: (typeof items)[number], showStoreMeta: boolean) => (
    <li
      key={line.productId}
      className="flex gap-3 pb-5 border-b last:border-0 last:pb-0"
      style={{ borderColor: 'var(--line)' }}
    >
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
        {showStoreMeta && line.storeName ? (
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
        <p className="font-sans text-[11px] text-[var(--text-4)] mt-0.5">{formatPrice(line.price ?? 0, symbol)} each</p>
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
            onClick={() => handleRemove(line.productId)}
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
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center py-24 px-4">
        <h1 className="font-display text-[40px] font-light text-[var(--text)] mb-4">Your cart is empty</h1>
        <Link
          href="/shop"
          className="font-sans text-[13px] font-semibold uppercase tracking-[0.2em] px-8 py-3 rounded-[10px] bg-[var(--gold)] text-black hover:opacity-90 transition-opacity"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between py-8 px-6 md:px-12 bg-[var(--surface)] border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        <div>
          {isMultiVendor && (
            <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-[var(--text-4)] mb-1">
              {storeKeys.length} stores · checkout separately
            </p>
          )}
          <h1 className="font-display font-light text-[40px] text-[var(--text)]">Cart</h1>
          <p className="font-sans text-[14px] text-[var(--text-3)] mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-[var(--gold)] hover:underline shrink-0"
        >
          Continue shopping <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-4 lg:px-12 grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-6">
          {isMultiVendor && (
            <div
              className="flex gap-3 items-start p-4 md:p-5 rounded-[14px] border"
              style={{ borderColor: 'var(--line-gold)', background: 'var(--gold-bg)' }}
              role="status"
            >
              <Info className="w-4 h-4 shrink-0 text-[var(--gold)] mt-0.5" aria-hidden />
              <p className="font-sans text-[13px] leading-relaxed text-[var(--text-2)]">
                Your cart has items from {storeKeys.length} stores. Each store is a separate order with its own shipping.
              </p>
            </div>
          )}

          {storeKeys.map((storeKey) => {
            const groupLines = groups[storeKey]!;
            const storeName = groupLines[0]?.storeName ?? 'Unknown Store';
            const groupSubtotal = getStoreSubtotal(groupLines);
            return (
              <section
                key={storeKey}
                className="p-6 md:p-8 rounded-[14px] border bg-[var(--surface)]"
                style={{ borderColor: 'var(--line)' }}
              >
                <p className={labelClass}>{storeName}</p>
                <ul className="space-y-5 mb-6">{groupLines.map((line) => renderLineRow(line, !isMultiVendor))}</ul>
                <p className="font-sans text-[13px] text-[var(--text-3)] text-right pb-4 border-b mb-4" style={{ borderColor: 'var(--line)' }}>
                  Store subtotal:{' '}
                  <span className="text-[var(--text)] font-medium">{formatPrice(groupSubtotal, symbol)}</span>
                </p>
                <Link href={checkoutHref(storeKey)} className={primaryBtnClass}>
                  Checkout — {storeName}
                </Link>
              </section>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-[88px] h-fit">
          <div
            className="p-6 md:p-8 rounded-[14px] border"
            style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
          >
            <h2 className="font-display text-[24px] font-normal text-[var(--text)] mb-6">Order summary</h2>
            <div className="flex justify-between font-sans text-[14px] text-[var(--text-3)] mb-2">
              <span>Subtotal</span>
              <span className="text-[var(--text)]">{formatPrice(getSubtotal(), symbol)}</span>
            </div>
            <p className="font-sans text-[12px] text-[var(--text-4)] mb-6">Coupons can be applied at checkout.</p>
            <div className="flex justify-between items-baseline mb-6 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
              <span className="font-sans text-[14px] font-medium text-[var(--text-3)]">Total</span>
              <span className="font-display text-[24px] font-light text-[var(--gold)]">{formatPrice(getSubtotal(), symbol)}</span>
            </div>
            {!isMultiVendor ? (
              <Link href={checkoutHref(storeKeys[0]!)} className={`${primaryBtnClass} mb-4`}>
                Proceed to checkout
              </Link>
            ) : (
              <p className="font-sans text-[13px] text-[var(--text-3)] text-center italic mb-4">
                Select a store above to checkout
              </p>
            )}
            <Link
              href="/shop"
              className="block text-center font-sans text-[13px] font-medium text-[var(--gold)] hover:underline"
            >
              Continue shopping
            </Link>
            <p className="font-sans text-[11px] text-[var(--text-4)] text-center mt-4">Visa, Mastercard, Stripe</p>
          </div>
        </div>
      </div>

      {status !== 'authenticated' && (
        <p className="font-sans text-[13px] text-[var(--text-3)] text-center pb-10 px-4">
          <Link href="/auth/login" className="text-[var(--gold)] hover:underline">
            Sign in
          </Link>{' '}
          to save your cart.
        </p>
      )}
    </div>
  );
}
