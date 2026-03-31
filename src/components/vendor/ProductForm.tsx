'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/actions/product-admin.actions';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Package, DollarSign, LayoutGrid, ImageIcon, ToggleLeft } from 'lucide-react';
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
    isNewArrival: boolean;
    isActive: boolean;
  };
}

const inputClass = 'w-full rounded-xl border px-4 py-3 font-sans text-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-0';
const inputStyle = { background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--text)' };
const labelClass = 'font-sans text-[13px] font-medium block mb-2';
const labelStyle = { color: 'var(--text-2)' };

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
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const listHref = isAdmin ? '/admin/products' : '/vendor/products';

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
      isFeatured,
      isNewArrival,
      isActive,
    };
    if (productId) {
      const res = await updateProduct(productId, payload);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Product updated', variant: 'success' }); router.refresh(); }
    } else {
      const res = await createProduct(payload);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Product created', variant: 'success' }); router.push(listHref); }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        {/* Section: Basic info */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: 'var(--text)' }}>Basic info</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className={labelClass} style={labelStyle}>Title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="description" className={labelClass} style={labelStyle}>Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className={inputClass} style={{ ...inputStyle, minHeight: 120 }} />
            </div>
          </div>
        </div>

        {/* Section: Pricing & inventory */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: 'var(--text)' }}>Pricing & inventory</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="price" className={labelClass} style={labelStyle}>Price</label>
              <input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="comparePrice" className={labelClass} style={labelStyle}>Compare at price (optional)</label>
              <input id="comparePrice" type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="stock" className={labelClass} style={labelStyle}>Stock</label>
              <input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="sku" className={labelClass} style={labelStyle}>SKU</label>
              <input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Section: Organization */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: 'var(--text)' }}>Organization</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="categoryId" className={labelClass} style={labelStyle}>Category</label>
              <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} style={inputStyle}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label htmlFor="storeId" className={labelClass} style={labelStyle}>Assign to store</label>
                <select id="storeId" value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)} className={inputClass} style={inputStyle}>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="tags" className={labelClass} style={labelStyle}>Tags (comma separated)</label>
              <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bestseller, new" className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Section: Media */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: 'var(--text)' }}>Product images</h3>
          </div>
          <p className="font-sans text-[12px] mb-3" style={{ color: 'var(--text-4)' }}>Upload or add image URLs (first image is cover).</p>
          <ImageUpload value={images} onChange={setImages} maxCount={10} />
          <textarea value={images.join('\n')} onChange={(e) => setImages(e.target.value.split('\n').filter(Boolean))} className={`${inputClass} mt-3`} style={{ ...inputStyle, minHeight: 60 }} placeholder="Or paste image URLs, one per line (https://...)" />
        </div>

        {/* Section: Status — On/Off for Featured and Active */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
              <ToggleLeft className="w-4 h-4" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: 'var(--text)' }}>Status</h3>
          </div>
            <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-3)' }}>Featured</span>
              <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
                <button type="button" onClick={() => setIsFeatured(false)} className="rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors" style={{ background: !isFeatured ? 'var(--surface3)' : 'transparent', color: !isFeatured ? 'var(--text)' : 'var(--text-4)' }}>Off</button>
                <button type="button" onClick={() => setIsFeatured(true)} className="rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors" style={{ background: isFeatured ? 'var(--gold)' : 'transparent', color: isFeatured ? '#fff' : 'var(--text-4)' }}>On</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-3)' }}>New Arrival</span>
              <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
                <button type="button" onClick={() => setIsNewArrival(false)} className="rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors" style={{ background: !isNewArrival ? 'var(--surface3)' : 'transparent', color: !isNewArrival ? 'var(--text)' : 'var(--text-4)' }}>Off</button>
                <button type="button" onClick={() => setIsNewArrival(true)} className="rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors" style={{ background: isNewArrival ? 'var(--gold)' : 'transparent', color: isNewArrival ? '#fff' : 'var(--text-4)' }}>On</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-3)' }}>Active</span>
              <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
                <button type="button" onClick={() => setIsActive(false)} className="rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors" style={{ background: !isActive ? 'var(--surface3)' : 'transparent', color: !isActive ? 'var(--text)' : 'var(--text-4)' }}>Off</button>
                <button type="button" onClick={() => setIsActive(true)} className="rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors" style={{ background: isActive ? 'var(--gold)' : 'transparent', color: isActive ? '#fff' : 'var(--text-4)' }}>On</button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 p-6 lg:p-8 border-t" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
          <button type="submit" disabled={loading} className="rounded-xl px-6 py-3 font-sans text-[14px] font-semibold border-0 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90" style={{ background: 'var(--gold)', color: '#fff' }}>
            {loading ? 'Saving…' : productId ? 'Update product' : 'Create product'}
          </button>
          <Link href={listHref} className="rounded-xl px-6 py-3 font-sans text-[14px] font-medium border no-underline transition-colors hover:opacity-90" style={{ borderColor: 'var(--line)', color: 'var(--text-2)', background: 'transparent' }}>
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
