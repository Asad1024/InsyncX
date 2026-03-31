import { prisma } from '@/lib/prisma';

export type PlatformDisplaySettings = {
  currencySymbol: string;
  freeShippingThreshold: number | null;
  shippingCharge: number | null;
  taxEnabled: boolean;
  taxRatePercent: number | null;
};

/** Display settings for storefront: currency, shipping, tax. Cached per request. */
export async function getPlatformDisplaySettings(): Promise<PlatformDisplaySettings> {
  const settings = await prisma.platformSettings.findFirst({ where: { id: 'default' } });
  return {
    currencySymbol: settings?.currencySymbol ?? '$',
    freeShippingThreshold: settings?.freeShippingThreshold != null ? Number(settings.freeShippingThreshold) : null,
    shippingCharge: settings?.shippingCharge != null ? Number(settings.shippingCharge) : null,
    taxEnabled: settings?.taxEnabled ?? false,
    taxRatePercent: settings?.taxRatePercent != null ? Number(settings.taxRatePercent) : null,
  };
}
