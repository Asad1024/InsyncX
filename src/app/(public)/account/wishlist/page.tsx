import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { WishlistCard } from '@/components/account/WishlistCard';
import { WishlistHydrate } from '@/components/account/WishlistHydrate';
import { Heart } from 'lucide-react';
import { clearWishlist } from '@/actions/user.actions';

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          store: { select: { name: true, slug: true, isOfficial: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });
  const products = items.map((i) => i.product).filter(Boolean);
  const productIds = products.map((p) => p.id);

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10 xl:px-12">
      <WishlistHydrate productIds={productIds} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
        <div>
          <h1 className="account-name-gradient text-[clamp(28px,5vw,44px)] leading-tight">Wishlist</h1>
          <p className="mt-1 font-sans text-[13px] text-[var(--muted)]">
            {products.length} saved item{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        {products.length > 0 && (
          <form action={clearWishlist.bind(null, session.user.id)}>
            <button
              type="submit"
              className="rounded-full border border-white/15 bg-[rgba(255,255,255,0.04)] px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] transition-colors hover:border-[rgba(255,107,107,0.4)] hover:text-[#ff6b6b]"
            >
              Clear all
            </button>
          </form>
        )}
      </div>

      {products.length === 0 ? (
        <div className="account-glass-panel text-center">
          <div className="px-6 py-20 md:py-24">
            <Heart className="mx-auto mb-6 h-16 w-16 text-[var(--muted)]" strokeWidth={1.15} />
            <h2 className="font-display text-[28px] font-bold text-[var(--white)] md:text-[32px]">
              Your wishlist is empty
            </h2>
            <p className="mt-3 font-sans text-[14px] text-[var(--muted)]">
              Save items you love and find them here
            </p>
            <Link
              href="/shop"
              className="auth-submit-btn cart-checkout-neon mt-8 inline-flex rounded-[10px] border-0 px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-white no-underline"
            >
              Start shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {products.map((p) => (
            <WishlistCard key={p.id} product={p} userId={session.user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
