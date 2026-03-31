import type { CartLine } from '@/store/cart.store';

export function groupCartItemsByStore(items: CartLine[]) {
  return items.reduce((groups, item) => {
    const key = item.storeSlug ?? '__unknown__';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, CartLine[]>);
}

export function getStoreSubtotal(items: CartLine[]) {
  return items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
}

/** Match cart grouping: `__unknown__` means items with no storeSlug. */
export function filterCartItemsByStoreSlug(items: CartLine[], storeSlugParam: string) {
  if (storeSlugParam === '__unknown__') {
    return items.filter((i) => !i.storeSlug);
  }
  return items.filter((i) => i.storeSlug === storeSlugParam);
}
