'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useCartStore } from '@/store/cart.store';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { updateCartItemDb, removeFromCartDb } from '@/actions/cart.actions';
import { useToast } from '@/hooks/use-toast';
import { groupCartItemsByStore } from '@/lib/cart-utils';

export function CartSidebar() {
  const displaySettings = useDisplaySettings();
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const symbol = displaySettings.currencySymbol;
  const freeShipRemaining =
    displaySettings.freeShippingThreshold != null && subtotal < displaySettings.freeShippingThreshold
      ? displaySettings.freeShippingThreshold - subtotal
      : null;
  const { toast } = useToast();
  const { status } = useSession();
  const [exitingId, setExitingId] = useState<string | null>(null);

  useBodyScrollLock(isOpen);

  const storeKeys = Object.keys(groupCartItemsByStore(items));
  const checkoutHref =
    storeKeys.length === 1 ? `/checkout?store=${encodeURIComponent(storeKeys[0]!)}` : '/cart';

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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[400] transition-opacity duration-300 ease-out"
        style={{
          background: 'rgba(2,10,24,0.7)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        aria-hidden
        onClick={closeCart}
      />
      <aside
        className="fixed bottom-0 right-0 top-0 z-[401] flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden border-l border-[var(--border)] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-[420px] sm:max-w-[420px]"
        style={{
          backgroundColor: 'var(--bg2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5), -4px 0 20px rgba(29,110,255,0.1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div
          className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-6 py-5"
        >
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[22px] font-bold text-white" style={{ fontWeight: 700 }}>
              Cart
            </h2>
            {items.length > 0 && (
              <span className="rounded-full bg-[var(--blue)] px-2.5 py-0.5 font-sans text-[11px] font-medium text-white">
                {items.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-transparent text-[var(--muted)] transition-all duration-200 ease-out hover:rotate-90 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(29,110,255,0.12)',
                  boxShadow: '0 0 40px rgba(29,110,255,0.25)',
                }}
              >
                <ShoppingBag className="h-10 w-10 text-[var(--blue)]" strokeWidth={1.25} />
              </div>
              <p className="font-display text-center text-[24px] font-bold text-white" style={{ fontWeight: 700 }}>
                Nothing here yet.
              </p>
              <p className="mt-2 text-center font-sans text-[13px] text-[var(--muted)]">
                Add items to get started
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="auth-submit-btn mt-8 inline-flex border-0 px-8 py-3 text-center font-sans text-[13px] font-semibold uppercase tracking-wider"
              >
                Browse shop
              </Link>
            </div>
          </div>
        ) : (
          /* Lines + checkout in one flow inside the scroller so no flex-1 "void" between list and footer */
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
            <ul className="py-2">
              {items.map((line) => (
                <li
                  key={line.productId}
                  className={`cart-line-enter border-b border-[var(--border)] py-5 ${
                    exitingId === line.productId ? 'cart-row-exit' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/product/${line.slug ?? ''}`}
                      onClick={closeCart}
                      className="relative h-[88px] w-[72px] flex-shrink-0 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface3)]"
                    >
                      {line.image ? (
                        <Image
                          src={line.image}
                          alt={line.title ?? ''}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      ) : (
                        <div className="h-full w-full bg-[var(--surface3)]" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      {line.storeName ? (
                        <p className="mb-1 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--cyan)]">
                          {line.storeName}
                        </p>
                      ) : null}
                      <Link
                        href={`/product/${line.slug ?? ''}`}
                        onClick={closeCart}
                        className="mb-3 line-clamp-2 block font-display text-[13px] font-semibold leading-snug text-white transition-colors duration-200 hover:text-[var(--cyan)]"
                        style={{ fontWeight: 600 }}
                      >
                        {line.title}
                      </Link>
                      <div className="flex items-center justify-between gap-4">
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
                            className="cart-qty-animate min-w-[28px] text-center font-display text-[14px] font-semibold text-[var(--white)]"
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
                        <span className="font-display text-[16px] font-bold text-[var(--white)]" style={{ fontWeight: 700 }}>
                          {formatPrice((line.price ?? 0) * line.quantity, symbol)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(line.productId)}
                        className="mt-2 flex items-center gap-1 border-0 bg-transparent font-sans text-[11px] text-[var(--muted)] transition-all duration-200 ease-out hover:text-[#ff4d4d] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[var(--border)] bg-[var(--bg2)] py-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-4">
              <div className="mb-2 flex items-center justify-between border-b border-[var(--border)] pb-4">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                  Subtotal
                </span>
                <span
                  key={subtotal}
                  className="cart-total-pulse font-display text-[28px] font-bold text-gradient-insync"
                  style={{ fontWeight: 700 }}
                >
                  {formatPrice(subtotal, symbol)}
                </span>
              </div>
              {freeShipRemaining != null && freeShipRemaining > 0 && (
                <p className="mb-2 font-sans text-[12px] text-[var(--cyan)]">
                  Add {formatPrice(freeShipRemaining, symbol)} for free shipping
                </p>
              )}
              <p className="mb-5 font-sans text-[12px] italic text-[var(--muted)]">Coupons applied at checkout</p>
              <Link
                href={checkoutHref}
                onClick={closeCart}
                className="auth-submit-btn mb-3 flex w-full items-center justify-center border-0 px-4 py-4 text-center font-sans text-[13px] font-semibold uppercase tracking-wider"
              >
                {storeKeys.length > 1 ? 'View cart to checkout' : 'Checkout'}
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="w-full rounded-[10px] border border-[var(--border)] bg-transparent py-3 font-sans text-[13px] font-medium text-[var(--muted)] transition-all duration-200 ease-out hover:border-[var(--cyan)] hover:text-[var(--white)]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
