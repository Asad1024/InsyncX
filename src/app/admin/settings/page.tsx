import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCommissionPercent } from '@/lib/stripe';
import { PageHeader } from '@/components/shared/PageHeader';
import { ChangePasswordBlock } from '@/components/shared/ChangePasswordBlock';
import { CommissionForm } from '@/components/admin/CommissionForm';
import { HomepageCouponSettingsForm } from '@/components/admin/HomepageCouponSettingsForm';
import { Percent, KeyRound, Tag, DollarSign } from 'lucide-react';
import { DisplaySettingsForm } from '@/components/admin/DisplaySettingsForm';

const sectionLabelClass = 'font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-4)]';
const cardClass = 'rounded-2xl border p-6 lg:p-8 bg-[var(--surface)] border-[var(--line)]';

export default async function AdminSettingsPage() {
  const session = await auth();
  const [settings, commission, allCoupons] = await Promise.all([
    prisma.platformSettings.findFirst({ where: { id: 'default' } }),
    getCommissionPercent(),
    prisma.coupon.findMany({
      where: { isActive: true },
      include: { store: { select: { name: true } } },
      orderBy: { code: 'asc' },
    }),
  ]);

  const featuredCouponIds = Array.isArray(settings?.featuredCouponIds)
    ? (settings.featuredCouponIds as string[])
    : [];
  const couponOptions = allCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    discount: Number(c.discount),
    storeName: c.store?.name ?? null,
  }));

  const lastUpdated = settings?.updatedAt
    ? new Date(settings.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" subtitle="Platform configuration" />

      {/* Overview strip */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 mb-10">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 min-w-0">
          <p className={sectionLabelClass}>Commission</p>
          <p className="font-display text-2xl font-semibold text-[var(--gold)] mt-1">{commission}%</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 min-w-0">
          <p className={sectionLabelClass}>Currency</p>
          <p className="font-display text-2xl font-semibold text-[var(--text)] mt-1">{settings?.currencySymbol ?? '$'}</p>
        </div>
        {lastUpdated && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 min-w-0 col-span-2 sm:col-span-1">
            <p className={sectionLabelClass}>Last updated</p>
            <p className="font-sans text-[14px] text-[var(--text-2)] mt-1">{lastUpdated}</p>
          </div>
        )}
      </div>

      <div className="space-y-10">
        {/* Revenue & commission */}
        <section>
          <h2 className={sectionLabelClass + ' mb-4'}>Revenue & commission</h2>
          <div className={cardClass}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--gold-bg)] text-[var(--gold)]">
                <Percent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-[17px] font-semibold text-[var(--text)] mb-1">Commission rate</h3>
                <p className="font-sans text-[13px] text-[var(--text-3)] mb-5">
                  Percentage taken from each sale. Vendors receive the remainder.
                </p>
                <CommissionForm initialCommission={commission} />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing, shipping & tax */}
        <section>
          <h2 className={sectionLabelClass + ' mb-4'}>Pricing, shipping & tax</h2>
          <div className={cardClass}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--gold-bg)] text-[var(--gold)]">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-[17px] font-semibold text-[var(--text)] mb-1">Storefront display</h3>
                <p className="font-sans text-[13px] text-[var(--text-3)] mb-5">
                  Currency symbol, free shipping threshold, flat shipping charge when below threshold, and tax (on/off and rate).
                </p>
                <DisplaySettingsForm
                  initialCurrencySymbol={settings?.currencySymbol ?? '$'}
                  initialFreeShippingThreshold={
                    settings?.freeShippingThreshold != null ? Number(settings.freeShippingThreshold) : null
                  }
                  initialShippingCharge={
                    settings?.shippingCharge != null ? Number(settings.shippingCharge) : null
                  }
                  initialTaxEnabled={settings?.taxEnabled ?? false}
                  initialTaxRatePercent={
                    settings?.taxRatePercent != null ? Number(settings.taxRatePercent) : null
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Homepage */}
        <section>
          <h2 className={sectionLabelClass + ' mb-4'}>Homepage</h2>
          <div className={cardClass}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--gold-bg)] text-[var(--gold)]">
                <Tag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-[17px] font-semibold text-[var(--text)] mb-1">Coupon section</h3>
                <p className="font-sans text-[13px] text-[var(--text-3)]">
                  Show or hide the promo codes block and choose which coupons to feature.
                </p>
              </div>
            </div>
            <HomepageCouponSettingsForm
              initialEnabled={settings?.homepageCouponSectionEnabled ?? false}
              initialCouponIds={featuredCouponIds}
              coupons={couponOptions}
            />
          </div>
        </section>

        {/* Account */}
        {session?.user?.id && (
          <section>
            <h2 className={sectionLabelClass + ' mb-4'}>Account</h2>
            <div className={cardClass}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--surface3)] text-[var(--text-2)]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-[17px] font-semibold text-[var(--text)] mb-1">Change password</h3>
                  <p className="font-sans text-[13px] text-[var(--text-3)] mb-5">
                    Update your admin account password.
                  </p>
                  <ChangePasswordBlock userId={session.user.id} />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
