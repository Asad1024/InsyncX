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
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Label htmlFor="name">Store name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="slug">URL slug</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="mt-1" />
        <p className="text-xs text-muted mt-1">/store/{slug}</p>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex min-h-[100px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-white mt-1"
        />
      </div>
      <Button type="submit" disabled={loading}>Save</Button>
    </form>
  );
}
