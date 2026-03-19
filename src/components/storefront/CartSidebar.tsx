'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, X, ShoppingBag, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { updateCartItemDb, removeFromCartDb } from '@/actions/cart.actions';
import { useToast } from '@/hooks/use-toast';

export function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { toast } = useToast();
  const { status } = useSession();

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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[400] transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        aria-hidden
        onClick={closeCart}
      />
      {/* Sidebar panel */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-[401] w-[420px] flex flex-col bg-[var(--surface)] border-l shadow-[var(--shadow-xl)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{
          borderLeftColor: 'var(--line-md)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between py-6 px-6 pb-5 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[24px] font-normal text-[var(--text)]">
              Cart
            </h2>
            {items.length > 0 && (
              <span className="font-sans text-[12px] text-[var(--text-3)] ml-2">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--surface2)] border-none text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface3)] transition-[var(--ease)] cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6">
              <ShoppingBag className="w-12 h-12 text-[var(--text-4)] mb-4" strokeWidth={1} />
              <p className="font-display text-[28px] font-light text-[var(--text)]">
                Your cart is empty
              </p>
              <p className="font-sans text-[13px] text-[var(--text-3)] mt-2 text-center">
                Add items to get started
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="btn btn-primary btn-sm mt-6"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="py-0">
              {items.map((line) => (
                <li
                  key={line.productId}
                  className="py-5 border-b flex gap-4 items-start animate-fade-up"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <div className="relative w-[72px] h-[88px] flex-shrink-0 rounded-[10px] overflow-hidden bg-[var(--surface3)]">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.title ?? ''}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--surface3)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--gold)] mb-1">
                      Product
                    </p>
                    <Link
                      href={`/product/${line.slug ?? ''}`}
                      onClick={closeCart}
                      className="font-display text-[16px] font-normal text-[var(--text)] leading-[1.3] block mb-3 line-clamp-2 hover:text-[var(--gold)] transition-[var(--ease)]"
                    >
                      {line.title}
                    </Link>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(line.productId, -1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-[var(--surface2)] border text-[var(--text-2)] hover:border-[var(--line-md)] hover:text-[var(--text)] transition-[var(--ease)]"
                          style={{ borderColor: 'var(--line)' }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-sans text-[14px] font-medium text-[var(--text)] min-w-[24px] text-center">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(line.productId, 1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-[var(--surface2)] border text-[var(--text-2)] hover:border-[var(--line-md)] hover:text-[var(--text)] transition-[var(--ease)]"
                          style={{ borderColor: 'var(--line)' }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-sans text-[14px] font-semibold text-[var(--text)]">
                        {formatPrice((line.price ?? 0) * line.quantity)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(line.productId)}
                      className="font-sans text-[11px] font-medium text-[var(--text-4)] hover:text-[var(--red)] transition-[var(--ease)] bg-none border-none cursor-pointer py-1 mt-2 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 py-5 px-6 pb-6 border-t bg-[var(--surface)]" style={{ borderColor: 'var(--line)' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-3)]">
                Subtotal
              </span>
              <span className="font-display text-[32px] font-light text-[var(--text)]">
                {formatPrice(getSubtotal())}
              </span>
            </div>
            <p className="font-sans text-[12px] text-[var(--text-3)] italic mb-5">
              Coupons applied at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn btn-primary btn-full btn-lg mb-3"
            >
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="btn btn-ghost btn-full font-sans text-[13px] text-[var(--text-3)]"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
