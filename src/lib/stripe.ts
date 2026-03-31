import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.');
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });
  }
  return _stripe;
}

/** Lazy Stripe client — only created when used and when STRIPE_SECRET_KEY is set. */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeInstance() as unknown as Record<string, unknown>)[prop as string];
  },
});

/** Commission %: from DB (PlatformSettings) first, then env, then 10. */
export async function getCommissionPercent(): Promise<number> {
  const { prisma } = await import('@/lib/prisma');
  const settings = await prisma.platformSettings.findFirst({ where: { id: 'default' } });
  if (settings != null) return settings.commissionPercent;
  return parseInt(process.env.PLATFORM_COMMISSION_PERCENT ?? '10', 10);
}
