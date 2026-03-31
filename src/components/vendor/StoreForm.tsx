'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateStore } from '@/actions/store.actions';
import { useToast } from '@/hooks/use-toast';

export function StoreForm({
  store,
}: {
  store: { id: string; name: string; slug: string; description: string; logo: string; banner: string };
}) {
  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [description, setDescription] = useState(store.description);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateStore(store.id, { name, slug, description });
    if (res?.error) toast({ title: res.error, variant: 'error' });
    else toast({ title: 'Store updated', variant: 'success' });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="store-name" className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>
          Store name
        </Label>
        <Input
          id="store-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-xl border bg-[var(--surface2)] px-4 py-2.5 font-sans text-[14px] text-[var(--text)] placeholder:text-[var(--text-4)] focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          placeholder="e.g. My Store"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-slug" className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>
          URL slug
        </Label>
        <Input
          id="store-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          required
          className="rounded-xl border bg-[var(--surface2)] px-4 py-2.5 font-sans text-[14px] text-[var(--text)] placeholder:text-[var(--text-4)] focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          placeholder="my-store"
        />
        <p className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>
          Your store will be at: <span style={{ color: 'var(--text-3)' }}>/store/{slug || '…'}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-desc" className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>
          Description
        </Label>
        <textarea
          id="store-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-xl border bg-[var(--surface2)] px-4 py-3 font-sans text-[14px] text-[var(--text)] placeholder:text-[var(--text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] resize-y min-h-[100px]"
          style={{ borderColor: 'var(--line-md)' }}
          placeholder="Tell customers what your store is about..."
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="rounded-xl px-6 py-2.5 font-sans text-[14px] font-semibold bg-[var(--gold)] text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
