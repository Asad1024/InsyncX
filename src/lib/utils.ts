import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function uniqueSlug(base: string, suffix?: string): string {
  const slug = slugify(base);
  return suffix ? `${slug}-${suffix}` : `${slug}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatPrice(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

/** Get first product image URL from Prisma JSON (array, string, or object with numeric keys). */
export function getFirstProductImage(images: unknown): string | null {
  if (images == null) return null;
  if (Array.isArray(images)) {
    const first = images[0];
    return typeof first === 'string' && first.length > 0 ? first : null;
  }
  if (typeof images === 'string') {
    if (images.length === 0) return null;
    try {
      const parsed = JSON.parse(images) as unknown;
      return getFirstProductImage(parsed);
    } catch {
      return null;
    }
  }
  if (typeof images === 'object' && images !== null && !Array.isArray(images)) {
    const values = Object.values(images);
    const first = values[0];
    return typeof first === 'string' && first.length > 0 ? first : null;
  }
  return null;
}
