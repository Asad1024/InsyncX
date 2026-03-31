import type { UserRole, OrderStatus, CouponType, PayoutStatus } from '@prisma/client';

export type { UserRole, OrderStatus, CouponType, PayoutStatus };

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CartItemPayload {
  productId: string;
  quantity: number;
  title?: string;
  price?: number;
  image?: string;
  slug?: string;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  storeId?: string | null;
}
