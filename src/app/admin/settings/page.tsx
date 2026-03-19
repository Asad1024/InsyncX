import { prisma } from '@/lib/prisma';
import { getCommissionPercent } from '@/lib/stripe';
import { PageHeader } from '@/components/shared/PageHeader';

export default async function AdminSettingsPage() {
  const settings = await prisma.platformSettings.findFirst({ where: { id: 'default' } });
  const commission = settings?.commissionPercent ?? getCommissionPercent();

  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Configure InsyncX platform" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card card-p-lg">
          <h2 className="font-display text-[24px] font-normal mb-2" style={{ color: 'var(--text)' }}>Commission Rate</h2>
          <p className="font-sans text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>Percentage taken from each sale</p>
          <div className="flex items-center gap-4">
            <input
              type="number"
              readOnly
              value={commission}
              className="input w-[100px]"
            />
            <span className="font-sans text-[20px] font-medium" style={{ color: 'var(--text-3)' }}>%</span>
          </div>
        </div>
        <div className="card card-p-lg">
          <h2 className="font-display text-[24px] font-normal mb-2" style={{ color: 'var(--text)' }}>Maintenance Mode</h2>
          <p className="font-sans text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>Temporarily disable the storefront</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>Enable Maintenance Mode</p>
              <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Customers will see a maintenance page</p>
            </div>
            <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{settings?.maintenanceMode ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
