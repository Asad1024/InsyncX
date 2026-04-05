export default function ShopLoading() {
  return (
    <div className="relative min-h-screen">
      <div
        className="shop-page-backdrop pointer-events-none fixed inset-0 z-0"
        aria-hidden
      />
      <div className="relative z-10 px-4 pb-3 pt-4 md:px-12 md:pt-5">
        <div className="mx-auto flex max-w-5xl justify-center py-2">
          <div className="shop-product-skeleton h-[52px] w-full max-w-5xl rounded-full sm:h-[48px]" />
        </div>
      </div>
      <div className="relative z-10 px-6 pb-16 pt-4 md:px-12 md:pt-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(4,14,32,0.35)]"
            >
              <div className="shop-product-skeleton aspect-[4/5] w-full rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
