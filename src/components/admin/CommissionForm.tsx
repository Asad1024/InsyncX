'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCommissionPercent } from '@/actions/admin.actions';
import { useToast } from '@/hooks/use-toast';

export function CommissionForm({ initialCommission }: { initialCommission: number }) {
  const [value, setValue] = useState(String(initialCommission));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0 || num > 100) {
      toast({ title: 'Enter a number between 0 and 100', variant: 'error' });
      return;
    }
    setLoading(true);
    const res = await updateCommissionPercent(num);
    setLoading(false);
    if (res?.error) toast({ title: res.error, variant: 'error' });
    else {
      toast({ title: 'Commission updated', variant: 'success' });
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input w-[100px]"
        />
        <span className="font-sans text-[20px] font-medium" style={{ color: 'var(--text-3)' }}>%</span>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-4 py-2.5 font-sans text-[13px] font-semibold bg-[var(--gold)] text-black hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
