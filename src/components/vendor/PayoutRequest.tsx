'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PayoutRequest({ storeId, stripeConnectId }: { storeId: string; stripeConnectId: string | null }) {
  if (!stripeConnectId) {
    return (
      <div className="p-4 rounded-lg border border-border bg-surface mb-6">
        <p className="text-muted mb-2">Connect your Stripe account to request payouts.</p>
        <form action="/api/stripe/connect" method="POST">
          <input type="hidden" name="storeId" value={storeId} />
          <Button type="submit">Connect Stripe</Button>
        </form>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-lg border border-border bg-surface mb-6">
      <p className="text-muted">Stripe connected. Request payout from your dashboard.</p>
    </div>
  );
}
