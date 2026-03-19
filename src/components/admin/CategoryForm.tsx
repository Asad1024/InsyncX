'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { createCategory, updateCategory } from '@/actions/category.actions';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { FolderOpen } from 'lucide-react';
import type { Category } from '@prisma/client';

interface CategoryFormProps {
  categoryId?: string;
  parentCategories: Array<Pick<Category, 'id' | 'name' | 'slug'>>;
  initial?: {
    name: string;
    slug: string;
    image: string | null;
    parentId: string | null;
  };
}

const inputClass = 'w-full rounded-xl border px-4 py-3 font-sans text-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-0';
const inputStyle = { background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--text)' };
const labelClass = 'font-sans text-[13px] font-medium block mb-2';
const labelStyle = { color: 'var(--text-2)' };

export function CategoryForm({ categoryId, parentCategories, initial }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [parentId, setParentId] = useState(() => initial?.parentId ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const next = initial?.parentId ?? '';
    setParentId(next);
  }, [initial?.parentId]);

  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [name, slugTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { name: name.trim(), slug: slug.trim() || undefined, image: image || undefined, parentId: parentId === '' ? null : (parentId || undefined) };
    if (categoryId) {
      const res = await updateCategory(categoryId, payload);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Category updated', variant: 'success' }); router.push('/admin/categories'); router.refresh(); }
    } else {
      const res = await createCategory(payload);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Category created', variant: 'success' }); router.push('/admin/categories'); }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        {/* Section: Details */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
              <FolderOpen className="w-4 h-4" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: 'var(--text)' }}>Details</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClass} style={labelStyle}>Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Men" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="slug" className={labelClass} style={labelStyle}>Slug</label>
              <input id="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} placeholder="e.g. men" className={inputClass} style={inputStyle} />
              <p className="font-sans text-[12px] mt-1.5" style={{ color: 'var(--text-4)' }}>URL-friendly; leave blank to auto-generate from name.</p>
            </div>
          </div>
        </div>

        {/* Section: Image */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <h3 className="font-display text-[16px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Image</h3>
          <p className="font-sans text-[12px] mb-3" style={{ color: 'var(--text-4)' }}>Optional. Shown on category cards and in the shop.</p>
          <ImageUpload value={image ? [image] : []} onChange={(urls) => setImage(urls[0] ?? '')} maxCount={1} />
        </div>

        {/* Section: Parent (if any) */}
        {parentCategories.length > 0 && (
          <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
            <h3 className="font-display text-[16px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Parent category</h3>
            <select id="parentId" value={parentId ?? ''} onChange={(e) => setParentId(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">None (root category)</option>
              {parentCategories.filter((c) => c.id !== categoryId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 p-6 lg:p-8 border-t" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
          <button type="submit" disabled={loading} className="rounded-xl px-6 py-3 font-sans text-[14px] font-semibold border-0 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90" style={{ background: 'var(--gold)', color: '#0a0a0a' }}>
            {loading ? 'Saving…' : categoryId ? 'Update category' : 'Create category'}
          </button>
          <Link href="/admin/categories" className="rounded-xl px-6 py-3 font-sans text-[14px] font-medium border no-underline transition-colors hover:opacity-90" style={{ borderColor: 'var(--line)', color: 'var(--text-2)', background: 'transparent' }}>
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
