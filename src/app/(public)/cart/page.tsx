'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
  const [exitingId, setExitingId] = useState<string | null>(null);

  const groups = groupCartItemsByStore(items);
  const storeKeys = Object.keys(groups);
  const isMultiVendor = storeKeys.length > 1;
  const subtotal = getSubtotal();

  const handleUpdateQty = async (productId: string, delta: number) => {
    const line = items.find((i) => i.productId === productId);
    if (!line) return;
    const newQty = Math.max(0, line.quantity + delta);
    updateQuantity(productId, newQty);
    if (status === 'authenticated') await updateCartItemDb(productId, newQty);
    if (newQty === 0) toast({ title: 'Removed from cart', variant: 'default' });
  };

  const handleRemove = (productId: string) => {
    setExitingId(productId);
    window.setTimeout(() => {
      removeItem(productId);
      if (status === 'authenticated') removeFromCartDb(productId);
      toast({ title: 'Removed from cart', variant: 'default' });
      setExitingId(null);
    }, 280);
  };

  const checkoutHref = (storeKey: string) => `/checkout?store=${encodeURIComponent(storeKey)}`;

  const renderLineRow = (line: (typeof items)[number], showStoreMeta: boolean, isLast: boolean) => (
    <li
      key={line.productId}
      className={`flex gap-4 pb-5 ${!isLast ? 'border-b border-[var(--border)]' : ''} ${
        exitingId === line.productId ? 'cart-row-exit' : ''
      }`}
    >
      <Link
        href={line.slug ? `/product/${line.slug}` : '/shop'}
        className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface3)] transition-transform duration-200 ease-out hover:scale-105"
      >
        {line.image ? (
          <Image src={line.image} alt={line.title ?? ''} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="h-full w-full bg-[var(--surface3)]" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={line.slug ? `/product/${line.slug}` : '/shop'}
          className="line-clamp-2 font-display text-[15px] font-semibold text-[var(--white)] transition-colors duration-200 hover:text-[var(--cyan)]"
          style={{ fontWeight: 600 }}
        >
          {line.title}
        </Link>
        {showStoreMeta && line.storeName ? (
          line.storeSlug ? (
            <Link
              href={`/store/${line.storeSlug}`}
              className="mt-0.5 block truncate font-sans text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--cyan)]"
            >
              {line.storeName}
            </Link>
          ) : (
            <p className="mt-0.5 truncate font-sans text-[11px] text-[var(--muted)]">{line.storeName}</p>
          )
        ) : null}
        <p className="mt-0.5 font-sans text-[12px] text-[var(--muted)]">{formatPrice(line.price ?? 0, symbol)} each</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdateQty(line.productId, -1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(29,110,255,0.08)] text-[var(--white)] transition-all duration-200 ease-out hover:border-[var(--blue)] hover:bg-[rgba(29,110,255,0.2)] active:scale-[0.92]"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span
              key={line.quantity}
              className="cart-qty-animate min-w-[32px] text-center font-display text-[14px] font-semibold text-[var(--white)]"
              style={{ fontWeight: 600 }}
            >
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleUpdateQty(line.productId, 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(29,110,255,0.08)] text-[var(--white)] transition-all duration-200 ease-out hover:border-[var(--blue)] hover:bg-[rgba(29,110,255,0.2)] active:scale-[0.92]"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleRemove(line.productId)}
            className="inline-flex items-center gap-1 font-sans text-[12px] text-[var(--muted)] transition-all duration-200 ease-out hover:text-[#ff4d4d]"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
      <p
        className="shrink-0 self-start pt-0.5 font-display text-[15px] font-bold text-gradient-insync"
        style={{ fontWeight: 700 }}
      >
        {formatPrice((line.price ?? 0) * line.quantity, symbol)}
      </p>
    </li>
  );

  if (items.length === 0) {
    return (
      <div className="cart-page-bg relative z-0 flex min-h-screen flex-col items-center justify-center px-4 py-24">
        <div className="cart-page-blobs" aria-hidden>
          <span className="cart-page-blob cart-page-blob--a" />
          <span className="cart-page-blob cart-page-blob--b" />
          <span className="cart-page-blob cart-page-blob--c" />
        </div>
        <div
          className="relative z-[1] mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: 'rgba(29,110,255,0.12)',
            boxShadow: '0 0 48px rgba(29,110,255,0.2)',
          }}
        >
          <ShoppingBagIcon />
        </div>
        <h1 className="cart-title-metallic relative z-[1] text-center text-[clamp(32px,5vw,48px)]">
          Nothing here yet.
        </h1>
        <p className="relative z-[1] mt-3 text-center font-sans text-[15px] text-[var(--muted)]">
          Your cart is waiting — add something loud.
        </p>
        <Link
          href="/shop"
          className="cart-checkout-neon auth-submit-btn relative z-[1] mt-10 inline-flex border-0 px-10 py-4 font-sans text-[13px] font-semibold uppercase tracking-[0.15em]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-bg relative z-0 min-h-screen">
      <div className="cart-page-blobs" aria-hidden>
        <span className="cart-page-blob cart-page-blob--a" />
        <span className="cart-page-blob cart-page-blob--b" />
        <span className="cart-page-blob cart-page-blob--c" />
      </div>

      <div className="relative z-[1] flex flex-col gap-4 px-6 pb-6 pt-6 sm:flex-row sm:items-end sm:justify-between md:px-12 md:pb-8 md:pt-8">
        <div>
          <h1 className="cart-title-metallic text-[clamp(36px,6vw,68px)]">Cart</h1>
          <p className="mt-2 font-sans text-[14px] text-[var(--muted)]">
            {items.length} item{items.length !== 1 ? 's' : ''}
            {isMultiVendor ? ` · ${storeKeys.length} stores` : ''}
          </p>
        </div>
        <Link
          href="/shop"
          className="group relative inline-flex shrink-0 items-center gap-1 font-sans text-[14px] font-medium text-[var(--cyan)] transition-all duration-200 ease-out hover:gap-2"
        >
          Continue shopping
          <ChevronRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="relative z-[1] mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-2 lg:grid-cols-[1fr_380px] lg:px-12">
        <div className="space-y-6">
          {isMultiVendor && (
            <div
              className="cart-info-banner-enter cart-glass-panel flex items-start gap-3 rounded-2xl p-4 md:p-5"
              role="status"
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(29,110,255,0.2)',
                  boxShadow: '0 0 16px rgba(29,110,255,0.25)',
                }}
              >
                <Info className="h-4 w-4 text-[var(--blue)]" aria-hidden />
              </div>
              <p className="font-sans text-[13px] leading-relaxed text-[var(--muted)]">
                Your cart has items from {storeKeys.length} stores. Each store is a separate order with its own shipping.
              </p>
            </div>
          )}

          {storeKeys.map((storeKey, idx) => {
            const groupLines = groups[storeKey]!;
            const storeName = groupLines[0]?.storeName ?? 'Unknown Store';
            const groupSubtotal = getStoreSubtotal(groupLines);
            return (
              <section
                key={storeKey}
                className="cart-store-card cart-glass-panel p-7 md:p-8"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <p className="mb-6 font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--cyan)]">
                  {storeName}
                </p>
                <ul className="space-y-0">
                  {groupLines.map((line, lineIdx) =>
                    renderLineRow(line, !isMultiVendor, lineIdx === groupLines.length - 1)
                  )}
                </ul>
                <p className="mt-6 border-t border-[var(--border)] pb-4 pt-4 text-right font-sans text-[13px] text-[var(--muted)]">
                  Store subtotal:{' '}
                  <span className="font-semibold text-[var(--white)]">{formatPrice(groupSubtotal, symbol)}</span>
                </p>
                <Link
                  href={checkoutHref(storeKey)}
                  className="cart-checkout-neon auth-submit-btn flex w-full items-center justify-center border-0 px-4 py-4 text-center font-sans text-[12px] font-semibold uppercase tracking-[0.15em]"
                >
                  Checkout — {storeName}
                </Link>
              </section>
            );
          })}
        </div>

        <div className="h-fit lg:sticky lg:top-[calc(var(--nav-h)+12px)]">
          <div className="cart-glass-panel relative overflow-hidden p-6 md:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-70"
              style={{
                background: 'radial-gradient(circle, rgba(29,110,255,0.18) 0%, transparent 72%)',
              }}
              aria-hidden
            />
            <h2 className="relative font-display text-[22px] font-bold text-white" style={{ fontWeight: 700 }}>
              Order Summary
            </h2>
            <div className="relative mt-6 flex justify-between font-sans text-[14px] text-[var(--muted)]">
              <span>Subtotal</span>
              <span className="text-[var(--white)]">{formatPrice(subtotal, symbol)}</span>
            </div>
            <p className="relative mt-2 font-sans text-[12px] text-[var(--muted)]">Coupons can be applied at checkout.</p>
            <div className="relative mt-6 flex items-baseline justify-between border-t border-[var(--border)] pt-6">
              <span className="font-sans text-[14px] font-medium text-[var(--muted)]">Total</span>
              <span
                key={subtotal}
                className="cart-total-pulse font-display text-[36px] font-bold text-gradient-insync"
                style={{ fontWeight: 700 }}
              >
                {formatPrice(subtotal, symbol)}
              </span>
            </div>
            {!isMultiVendor ? (
              <Link
                href={checkoutHref(storeKeys[0]!)}
                className="cart-checkout-neon auth-submit-btn relative mt-6 flex w-full items-center justify-center border-0 px-4 py-4 text-center font-sans text-[12px] font-semibold uppercase tracking-[0.15em]"
              >
                Proceed to checkout
              </Link>
            ) : (
              <p className="relative mt-6 text-center font-sans text-[13px] italic text-[var(--muted)]">
                Select a store above to checkout
              </p>
            )}
            <Link
              href="/shop"
              className="relative mt-4 block text-center font-sans text-[13px] font-medium text-[var(--cyan)] transition-colors duration-200 hover:underline"
            >
              Continue shopping
            </Link>
            <p className="relative mt-6 text-center font-sans text-[11px] uppercase tracking-wider text-[var(--muted)]">
              Visa · Mastercard · Stripe
            </p>
          </div>
        </div>
      </div>

      {status !== 'authenticated' && (
        <p className="px-4 pb-12 text-center font-sans text-[13px] text-[var(--muted)]">
          <Link href="/auth/login" className="text-[var(--cyan)] transition-colors hover:underline">
            Sign in
          </Link>{' '}
          to save your cart.
        </p>
      )}
    </div>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-[var(--blue)]"
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
