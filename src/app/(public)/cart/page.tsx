'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';
import { CartCoupon } from '@/components/storefront/CartCoupon';
import { Minus, Plus, X } from 'lucide-react';
import { updateCartItemDb, removeFromCartDb } from '@/actions/cart.actions';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  useCart();
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { status } = useSession();
  const { toast } = useToast();

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center py-24 px-4">
        <h1 className="font-display text-[40px] font-light text-[#f0ede6] mb-4">Your cart is empty</h1>
        <Link
          href="/shop"
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] px-6 py-3 bg-[#c9a96e] text-[#080808] hover:bg-[#e8c98a] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] py-10 px-4 lg:px-16">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[65%_35%] gap-12">
        {/* Left — Cart items */}
        <div>
          <h1 className="font-display text-[40px] font-light text-[#f0ede6] mb-2">
            Your Cart
          </h1>
          <p className="font-sans text-[14px] text-[#888880] mb-10">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          <div className="space-y-0 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {items.map((line) => (
              <div
                key={line.productId}
                className="flex gap-6 py-6 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div className="relative w-20 h-[100px] shrink-0 bg-[#1a1a1a] overflow-hidden">
                  {line.image ? (
                    <Image src={line.image} alt={line.title ?? ''} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full bg-[#222]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${line.slug ?? ''}`}
                    className="font-display text-[16px] text-[#f0ede6] hover:text-[#c9a96e] transition-colors block"
                  >
                    {line.title}
                  </Link>
                  <p className="font-sans text-[11px] text-[#444440] mt-0.5">{formatPrice(line.price ?? 0)} each</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(line.productId, -1)}
                        className="w-8 h-8 flex items-center justify-center text-[#f0ede6] hover:bg-[#1a1a1a] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-sans text-[13px] text-[#f0ede6]">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(line.productId, 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#f0ede6] hover:bg-[#1a1a1a] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(line.productId)}
                      className="font-sans text-[12px] text-[#888880] hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4 inline" /> Remove
                    </button>
                  </div>
                </div>
                <div className="font-sans text-[14px] font-medium text-[#c9a96e] shrink-0">
                  {formatPrice((line.price ?? 0) * line.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Order summary */}
        <div>
          <div
            className="sticky top-[100px] p-8 border bg-[#111]"
            style={{ borderColor: 'rgba(201,169,110,0.25)' }}
          >
            <h2 className="font-display text-[24px] font-light text-[#f0ede6] mb-6">Order Summary</h2>
            <div className="flex justify-between font-sans text-[14px] text-[#888880] mb-4">
              <span>Subtotal</span>
              <span className="text-[#f0ede6]">{formatPrice(getSubtotal())}</span>
            </div>
            <CartCoupon />
            <div className="border-t py-4 mt-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
            <div className="flex justify-between items-baseline mb-6">
              <span className="font-sans text-[14px] text-[#888880]">Total</span>
              <span className="font-display text-[32px] font-light text-[#c9a96e]">{formatPrice(getSubtotal())}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full py-4 bg-[#c9a96e] text-[#080808] font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-center hover:bg-[#e8c98a] transition-colors mb-4"
            >
              Proceed to Checkout
            </Link>
            <Link href="/shop" className="block text-center font-sans text-[12px] text-[#c9a96e] hover:text-[#e8c98a] transition-colors">
              Continue Shopping
            </Link>
            <p className="font-sans text-[11px] text-[#444440] text-center mt-4">Visa, Mastercard, Stripe</p>
          </div>
        </div>
      </div>
      {status !== 'authenticated' && (
        <p className="font-sans text-[13px] text-[#888880] text-center mt-8">
          <Link href="/auth/login" className="text-[#c9a96e] hover:underline">Sign in</Link> to save your cart.
        </p>
      )}
    </div>
  );
}
