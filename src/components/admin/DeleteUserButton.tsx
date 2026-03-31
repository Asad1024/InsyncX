'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteUser } from '@/actions/admin.actions';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleConfirm = async () => {
    setLoading(true);
    const res = await deleteUser(userId);
    setLoading(false);
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
      return;
    }
    toast({ title: 'User deleted', variant: 'success' });
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm text-[var(--red)] hover:bg-[var(--red-bg)]"
        aria-label="Delete user"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete user"
        description={`This will permanently delete ${userName} and all their data (stores, orders, cart, wishlist, reviews). This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
}
