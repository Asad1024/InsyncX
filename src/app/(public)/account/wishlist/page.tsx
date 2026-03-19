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
    <div className="py-10 px-12" style={{ padding: '40px 48px' }}>
      <WishlistHydrate productIds={productIds} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="font-display text-[40px] font-light"
            style={{ color: 'var(--text)' }}
          >
            Wishlist
          </h1>
          <p className="font-sans text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>
            {products.length} saved item{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        {products.length > 0 && (
          <form action={clearWishlist.bind(null, session.user.id)}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Clear All
            </button>
          </form>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 px-6">
          <Heart
            className="w-16 h-16 mx-auto mb-6"
            style={{ color: 'var(--text-4)' }}
          />
          <h2
            className="font-display text-[36px] font-light"
            style={{ color: 'var(--text)' }}
          >
            Your wishlist is empty
          </h2>
          <p className="font-sans text-[14px] mt-3" style={{ color: 'var(--text-3)' }}>
            Save items you love and find them here
          </p>
          <Link href="/shop" className="btn btn-primary mt-6 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <WishlistCard key={p.id} product={p} userId={session.user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
