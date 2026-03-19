'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, ExternalLink, Loader2 } from 'lucide-react';
import { uploadImages } from '@/actions/upload.actions';
import { updateStore } from '@/actions/store.actions';
import { useToast } from '@/hooks/use-toast';

interface StorePreviewCardProps {
  store: { id: string; name: string; slug: string; logo: string | null; banner: string | null };
}

export function StorePreviewCard({ store }: StorePreviewCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerLoading(true);
    const formData = new FormData();
    formData.append('files', file);
    const result = await uploadImages(formData);
    if (result.error) {
      toast({ title: result.error, variant: 'error' });
      setBannerLoading(false);
      return;
    }
    const url = result.urls?.[0];
    if (url) {
      const res = await updateStore(store.id, { banner: url });
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Banner updated', variant: 'success' }); router.refresh(); }
    }
    e.target.value = '';
    setBannerLoading(false);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    const formData = new FormData();
    formData.append('files', file);
    const result = await uploadImages(formData);
    if (result.error) {
      toast({ title: result.error, variant: 'error' });
      setLogoLoading(false);
      return;
    }
    const url = result.urls?.[0];
    if (url) {
      const res = await updateStore(store.id, { logo: url });
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else { toast({ title: 'Logo updated', variant: 'success' }); router.refresh(); }
    }
    e.target.value = '';
    setLogoLoading(false);
  };

  return (
    <>
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleBannerChange}
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleLogoChange}
      />
      <div
        className="rounded-2xl border overflow-hidden mb-10"
        style={{ borderColor: 'var(--line)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}
      >
        <div
          className="relative"
          style={{ aspectRatio: '21/6', minHeight: 180, background: 'var(--surface3)' }}
        >
          {store.banner ? (
            <Image src={store.banner} alt="" fill className="object-cover" priority />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--surface3) 0%, var(--surface2) 100%)' }}
            >
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-4)' }}>
                No banner — click Change banner to upload
              </span>
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.85) 0%, transparent 50%)' }}
          />
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={bannerLoading}
            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-[13px] font-medium bg-black/70 text-white hover:bg-black/85 transition-colors disabled:opacity-60"
          >
            {bannerLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            Change banner
          </button>
        </div>
        <div className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoLoading}
              aria-label="Change logo"
              title="Change logo"
              className="w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 flex items-center justify-center shadow-lg hover:ring-2 hover:ring-[var(--gold)] transition-all disabled:opacity-60"
              style={{ borderColor: 'var(--line-gold)', background: 'var(--gold-bg)' }}
            >
              {logoLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--gold)' }} />
              ) : store.logo ? (
                <Image src={store.logo} alt="" width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <span className="font-display text-[32px] font-normal" style={{ color: 'var(--gold)' }}>
                  {store.name.slice(0, 1)}
                </span>
              )}
            </button>
            <div>
              <h2 className="font-display text-[26px] font-normal tracking-tight" style={{ color: 'var(--text)' }}>
                {store.name}
              </h2>
              <p className="font-sans text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                /store/{store.slug}
              </p>
            </div>
          </div>
          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-[14px] font-semibold transition-colors hover:opacity-90"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            Open Store
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
