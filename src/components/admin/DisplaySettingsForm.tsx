'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePlatformDisplaySettings } from '@/actions/admin.actions';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';

type Props = {
  initialCurrencySymbol: string;
  initialFreeShippingThreshold: number | null;
  initialShippingCharge: number | null;
  initialTaxEnabled: boolean;
  initialTaxRatePercent: number | null;
};

export function DisplaySettingsForm({
  initialCurrencySymbol,
  initialFreeShippingThreshold,
  initialShippingCharge,
  initialTaxEnabled,
  initialTaxRatePercent,
}: Props) {
  const [currencySymbol, setCurrencySymbol] = useState(initialCurrencySymbol || '$');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    initialFreeShippingThreshold != null ? String(initialFreeShippingThreshold) : ''
  );
  const [shippingCharge, setShippingCharge] = useState(
    initialShippingCharge != null ? String(initialShippingCharge) : ''
  );
  const [taxEnabled, setTaxEnabled] = useState(initialTaxEnabled);
  const [taxRatePercent, setTaxRatePercent] = useState(
    initialTaxRatePercent != null ? String(initialTaxRatePercent) : ''
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const freeShipNum = freeShippingThreshold.trim() === '' ? null : parseFloat(freeShippingThreshold);
    const shippingNum = shippingCharge.trim() === '' ? null : parseFloat(shippingCharge);
    const taxRateNum = taxRatePercent.trim() === '' ? null : parseFloat(taxRatePercent);
    if (freeShipNum != null && (Number.isNaN(freeShipNum) || freeShipNum < 0)) {
      toast({ title: 'Free shipping threshold must be 0 or more', variant: 'error' });
      return;
    }
    if (shippingNum != null && (Number.isNaN(shippingNum) || shippingNum < 0)) {
      toast({ title: 'Shipping charge must be 0 or more', variant: 'error' });
      return;
    }
    if (taxEnabled && (taxRateNum == null || Number.isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 100)) {
      toast({ title: 'Tax rate must be between 0 and 100', variant: 'error' });
      return;
    }
    setLoading(true);
    const res = await updatePlatformDisplaySettings({
      currencySymbol: currencySymbol.trim() || '$',
      freeShippingThreshold: freeShipNum ?? null,
      shippingCharge: shippingNum ?? null,
      taxEnabled,
      taxRatePercent: taxEnabled ? (taxRateNum ?? null) : null,
    });
    setLoading(false);
    if (res?.error) toast({ title: res.error, variant: 'error' });
    else {
      toast({ title: 'Display settings saved', variant: 'success' });
      router.refresh();
    }
  };

  const inputClass =
    'w-full max-w-[200px] bg-[var(--surface2)] border rounded-[10px] py-2.5 px-3 font-sans text-[14px] text-[var(--text)] placeholder:text-[var(--text-4)] outline-none transition-all duration-150 focus:border-[var(--line-gold)]';
  const labelClass = 'font-sans text-[12px] font-medium text-[var(--text-2)] block mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="currencySymbol" className={labelClass}>
          Currency symbol
        </label>
        <input
          id="currencySymbol"
          type="text"
          maxLength={10}
          value={currencySymbol}
          onChange={(e) => setCurrencySymbol(e.target.value)}
          className={inputClass}
          placeholder="$"
        />
        <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
          Shown on product and cart prices (e.g. $, €, ₹)
        </p>
      </div>

      <div>
        <label htmlFor="freeShippingThreshold" className={labelClass}>
          Free shipping threshold (optional)
        </label>
        <input
          id="freeShippingThreshold"
          type="number"
          min={0}
          step={0.01}
          value={freeShippingThreshold}
          onChange={(e) => setFreeShippingThreshold(e.target.value)}
          className={inputClass}
          placeholder="e.g. 50"
        />
        <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
          Free shipping on orders over this amount. Leave empty to hide.
        </p>
        {freeShippingThreshold.trim() !== '' && !Number.isNaN(parseFloat(freeShippingThreshold)) && (
          <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
            Preview: “Free shipping on orders over {formatPrice(parseFloat(freeShippingThreshold), currencySymbol.trim() || '$')}”
          </p>
        )}
      </div>

      <div>
        <label htmlFor="shippingCharge" className={labelClass}>
          Shipping charge (optional)
        </label>
        <input
          id="shippingCharge"
          type="number"
          min={0}
          step={0.01}
          value={shippingCharge}
          onChange={(e) => setShippingCharge(e.target.value)}
          className={inputClass}
          placeholder="e.g. 5"
        />
        <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
          Flat amount when order is below free shipping threshold. Leave empty for free shipping.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={taxEnabled}
            onChange={(e) => setTaxEnabled(e.target.checked)}
            className="rounded border-[var(--line)]"
          />
          <span className={labelClass + ' mb-0'}>Enable tax</span>
        </label>
      </div>
      {taxEnabled && (
        <div>
          <label htmlFor="taxRatePercent" className={labelClass}>
            Tax rate (%)
          </label>
          <input
            id="taxRatePercent"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={taxRatePercent}
            onChange={(e) => setTaxRatePercent(e.target.value)}
            className={inputClass}
            placeholder="e.g. 8.5"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-4 py-2.5 font-sans text-[13px] font-semibold bg-[var(--gold)] text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Save display settings'}
      </button>
    </form>
  );
}
