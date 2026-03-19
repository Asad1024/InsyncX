'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProduct, updateProduct } from '@/actions/product-admin.actions';
import { useToast } from '@/hooks/use-toast';
import type { Category, Store } from '@prisma/client';

interface ProductFormProps {
  productId?: string;
  categories: Category[];
  storeId: string;
  stores: Store[];
  isAdmin: boolean;
  initial?: {
    title: string;
    description: string;
    price: number;
    comparePrice?: number;
    images: string[];
    stock: number;
    sku: string;
    categoryId: string;
    tags: string[];
    isFeatured: boolean;
    isActive: boolean;
  };
}

export function ProductForm({
  productId,
  categories,
  storeId,
  stores,
  isAdmin,
  initial,
}: ProductFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [comparePrice, setComparePrice] = useState(initial?.comparePrice != null ? String(initial.comparePrice) : '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '');
  const [selectedStoreId, setSelectedStoreId] = useState(storeId);
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title,
      description,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      images,
      stock,
      sku: sku || undefined,
      categoryId,
      storeId: isAdmin ? selectedStoreId : storeId,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isFeatured: isAdmin ? isFeatured : undefined,
      isActive,
    };
    if (productId) {
      const res = await updateProduct(productId, payload);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Product updated', variant: 'success' }); router.refresh(); }
    } else {
      const res = await createProduct(payload);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Product created', variant: 'success' }); router.push('/vendor/products'); }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex min-h-[120px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-white mt-1"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="comparePrice">Compare at price (optional)</Label>
          <Input id="comparePrice" type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {isAdmin && (
        <>
          <div>
            <Label htmlFor="storeId">Assign to store</Label>
            <select
              id="storeId"
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-white"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-accent" />
            <span className="text-sm">Featured</span>
          </label>
        </>
      )}
      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bestseller, new" className="mt-1" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-accent" />
        <span className="text-sm">Active</span>
      </label>
      <div>
        <Label>Images (URLs, one per line)</Label>
        <textarea
          value={images.join('\n')}
          onChange={(e) => setImages(e.target.value.split('\n').filter(Boolean))}
          className="mt-1 flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-white"
          placeholder="https://..."
        />
      </div>
      <Button type="submit" disabled={loading}>{productId ? 'Update' : 'Create'} product</Button>
    </form>
  );
}
