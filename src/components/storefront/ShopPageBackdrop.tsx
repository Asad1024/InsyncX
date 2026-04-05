'use client';

import { useEffect, useRef } from 'react';

/** Cursor-follow spotlight + soft orbs + faded grid behind shop content */
export function ShopPageBackdrop() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    const set = (cx: number, cy: number) => {
      el.style.setProperty('--shop-spot-x', `${cx}%`);
      el.style.setProperty('--shop-spot-y', `${cy}%`);
    };
    set(50, 38);
    const onMove = (e: MouseEvent) => {
      set((e.clientX / Math.max(window.innerWidth, 1)) * 100, (e.clientY / Math.max(window.innerHeight, 1)) * 100);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={layerRef} className="shop-page-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden />
  );
}
