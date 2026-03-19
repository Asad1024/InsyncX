'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { useToast } from '@/hooks/use-toast';
import { addToCartDb } from '@/actions/cart.actions';
import { useSession } from 'next-auth/react';
import { Heart, Minus, Plus, ShoppingBag, ExternalLink, Plus as PlusIcon } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { StarRating } from './StarRating';
import { Breadcrumb } from './Breadcrumb';
import { AddReviewForm } from './AddReviewForm';
import type { Product, Store, Category } from '@prisma/client';

type Related = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface ProductDetailClientProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    stock: number;
    store: { id: string; name: string; slug: string; isOfficial: boolean };
    category: { id: string; name: string; slug: string };
    reviews: { id: string; rating: number; comment: string | null; createdAt: Date; userName: string | null }[];
  };
  related: Related[];
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addItem, openCart } = useCartStore();
  const { status } = useSession();
  const img = product.images[selectedImage] ?? product.images[0];

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
      : 0;
  const savePercent =
    product.comparePrice != null && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...ratingCounts.map((r) => r.count), 1);

  const handleAddToCart = async () => {
    if (product.stock < 1) {
      toast({ title: 'Out of stock', variant: 'error' });
      return;
    }
    setAddingToCart(true);
    const qty = Math.min(quantity, product.stock);
    addItem({
      productId: product.id,
      quantity: qty,
      title: product.title,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
    });
    if (status === 'authenticated') await addToCartDb(product.id, qty);
    openCart();
    toast({ title: 'Added to cart', variant: 'success' });
    setAddingToCart(false);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((v) => (v === id ? null : id));
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: product.category.name, href: `/shop?category=${product.category.slug}` },
    { label: product.title },
  ];

  const accordionSections = [
    { id: 'description', title: 'Description', content: product.description?.replace(/\n/g, '<br />') ?? '' },
    { id: 'shipping', title: 'Shipping & Returns', content: 'Standard shipping 5–7 business days. Free returns within 30 days.' },
    { id: 'store', title: 'Store Info', content: `Sold by ${product.store.name}. Visit store for more details.` },
  ];

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-12 py-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-start">
        {/* Left — Gallery */}
        <div className="sticky top-[88px]">
          <div className="relative aspect-[3/4] rounded-[14px] overflow-hidden bg-[var(--surface2)] cursor-zoom-in">
            {img ? (
              <Image
                src={img}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-400 hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-[var(--surface2)]" />
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.store.isOfficial && (
                <span className="badge badge-gold">Official</span>
              )}
              {product.store.isOfficial === false && (
                <span className="badge badge-neutral">Featured</span>
              )}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-[72px] h-[88px] rounded-[10px] overflow-hidden bg-[var(--surface2)] cursor-pointer border-2 flex-shrink-0 transition-all duration-150 ${
                    selectedImage === i ? 'border-[var(--gold)]' : 'border-transparent hover:border-[var(--line-md)]'
                  }`}
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="72px" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div>
          <Breadcrumb items={breadcrumbItems} />

          <Link
            href={`/store/${product.store.slug}`}
            className="inline-flex items-center gap-1.5 mb-4 w-fit"
          >
            <span className="w-5 h-5 rounded-full bg-[var(--gold-bg)] flex items-center justify-center font-sans text-[10px] font-semibold text-[var(--text-4)] uppercase tracking-[0.08em] shrink-0">
              {product.store.name.slice(0, 1)}
            </span>
            <span className="font-sans text-[10px] font-semibold text-[var(--text-4)] uppercase tracking-[0.08em]">By</span>
            <span className="font-sans text-[11px] font-semibold text-[var(--gold)] hover:text-[var(--gold-dim)] transition-colors duration-150">
              {product.store.name}
            </span>
            <ExternalLink className="w-2.5 h-2.5 text-[var(--gold)]" />
          </Link>

          <h1 className="font-display font-normal text-[42px] text-[var(--text)] leading-[1.1] mb-4">
            {product.title}
          </h1>

          <div className="flex items-center gap-2.5 mb-5">
            <StarRating value={avgRating} size="md" />
            <span className="font-sans text-[13px] text-[var(--text-3)]">
              ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-sans text-[28px] font-semibold text-[var(--text)]">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice != null && product.comparePrice > product.price && (
              <span className="font-sans text-[18px] text-[var(--text-4)] line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {savePercent > 0 && (
              <span className="badge badge-green">-{savePercent}%</span>
            )}
          </div>

          <div className="h-px bg-[var(--line)] my-6" />

          <div className="flex items-center gap-2 mb-6">
            {product.stock > 10 && (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--green)]" />
                <span className="font-sans text-[13px] font-medium text-[var(--green)]">In Stock</span>
              </>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--amber)]" />
                <span className="font-sans text-[13px] font-medium text-[var(--amber)]">Only {product.stock} left</span>
              </>
            )}
            {product.stock === 0 && (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--red)]" />
                <span className="font-sans text-[13px] font-medium text-[var(--red)]">Out of Stock</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mb-5">
            <span className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-3)]">
              Quantity
            </span>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--surface2)] border font-sans text-[18px] text-[var(--text-2)] hover:border-[var(--line-md)] hover:text-[var(--text)] transition-all duration-150 disabled:opacity-30"
                style={{ borderColor: 'var(--line)' }}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-sans text-[15px] font-medium text-[var(--text)] min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--surface2)] border font-sans text-[18px] text-[var(--text-2)] hover:border-[var(--line-md)] hover:text-[var(--text)] transition-all duration-150 disabled:opacity-30"
                style={{ borderColor: 'var(--line)' }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className="btn btn-primary btn-full btn-lg mb-3 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <span className="w-[18px] h-[18px] border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <ShoppingBag className="w-[18px] h-[18px]" />
            )}
            Add to Cart
          </button>
          <Link
            href="/account/wishlist"
            className="btn btn-secondary btn-full mb-7 flex items-center justify-center gap-2.5"
          >
            <Heart className="w-4 h-4" />
            Add to Wishlist
          </Link>

          <div className="h-px bg-[var(--line)]" />

          <div className="mt-6">
            {accordionSections.map((section) => (
              <div key={section.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <button
                  type="button"
                  onClick={() => toggleAccordion(section.id)}
                  className="w-full flex items-center justify-between py-4"
                >
                  <span className={`font-sans text-[14px] font-medium transition-colors duration-150 ${openAccordion === section.id ? 'text-[var(--text)]' : 'text-[var(--text-2)] hover:text-[var(--text)]'}`}>
                    {section.title}
                  </span>
                  <PlusIcon
                    className="w-4 h-4 text-[var(--text-3)] transition-transform duration-250"
                    style={{ transform: openAccordion === section.id ? 'rotate(45deg)' : 'none' }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-[max-height] duration-350 ease-out"
                  style={{ maxHeight: openAccordion === section.id ? 400 : 0 }}
                >
                  {section.id === 'description' ? (
                    <div
                      className="pb-4 font-sans text-[14px] text-[var(--text-3)] leading-[1.7]"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  ) : (
                    <p className="pb-4 font-sans text-[14px] text-[var(--text-3)] leading-[1.7]">
                      {section.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24 pt-16 border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <h2 className="font-display font-light text-[36px] text-[var(--text)]">
            Customer Reviews
          </h2>
          <button
            type="button"
            onClick={() => reviewFormRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-ghost btn-sm"
          >
            Write a Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="flex items-center gap-6">
            <span className="font-display font-light text-[72px] text-[var(--gold)]">
              {avgRating.toFixed(1)}
            </span>
            <div>
              <StarRating value={avgRating} size="lg" />
              <p className="font-sans text-[13px] text-[var(--text-3)] mt-1">
                Based on {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="font-sans text-[12px] text-[var(--text-3)] w-2">{star}</span>
                <StarRating value={star} size="sm" />
                <div className="flex-1 h-1.5 rounded-full bg-[var(--surface3)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--gold)] transition-[width] duration-500 ease-out"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="font-sans text-[12px] text-[var(--text-3)] min-w-[24px] text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ul className="flex flex-col gap-6">
          {product.reviews.map((r) => (
            <li key={r.id} className="card card-p">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--surface3)] flex items-center justify-center font-sans text-[13px] font-semibold text-[var(--text-3)] shrink-0">
                    {(r.userName ?? 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-medium text-[var(--text)]">
                      {r.userName ?? 'Anonymous'}
                    </p>
                    <p className="font-sans text-[12px] text-[var(--text-4)] mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarRating value={r.rating} size="sm" />
              </div>
              {r.comment && (
                <p className="font-sans text-[14px] text-[var(--text-2)] leading-[1.7] mt-3">
                  {r.comment}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div ref={reviewFormRef} className="mt-12">
          <AddReviewForm productId={product.id} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display font-light text-[36px] text-[var(--text)] mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
