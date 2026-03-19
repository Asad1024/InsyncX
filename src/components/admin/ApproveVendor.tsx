'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { approveVendorStore } from '@/actions/admin.actions';

export function ApproveVendor({ storeId }: { storeId: string }) {
  const router = useRouter();
  const handleApprove = async () => {
    await approveVendorStore(storeId);
    router.refresh();
  };
  return <Button size="sm" onClick={handleApprove}>Approve</Button>;
}
