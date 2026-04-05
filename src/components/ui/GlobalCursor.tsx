'use client';

import { useEffect, useRef, useState } from 'react';

function isInteractive(el: EventTarget | null): boolean {
  if (!el || !(el instanceof Element)) return false;
  return !!el.closest(
    'a[href], button, [role="button"], input[type="submit"], input[type="button"], label[for], [data-cursor-hover], [data-cursor="interactive"]',
  );
}

/**
 * Single “precision reticle” — instant position (no trailing / LERP layer).
 * Keeps click ripples; respects reduced motion & coarse pointers.
 */
export function GlobalCursor() {
  const [active, setActive] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActive(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!active) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    const onMove = (e: MouseEvent) => {
      anchor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const under = document.elementFromPoint(e.clientX, e.clientY);
      document.documentElement.toggleAttribute('data-cursor-hover', isInteractive(under));
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      document.documentElement.setAttribute('data-cursor-down', '1');
      const rip = document.createElement('div');
      rip.className = 'insync-ripple-fx';
      rip.style.left = `${e.clientX}px`;
      rip.style.top = `${e.clientY}px`;
      document.body.appendChild(rip);
      window.setTimeout(() => rip.remove(), 520);
    };

    const onPointerUp = () => document.documentElement.removeAttribute('data-cursor-down');

    document.documentElement.setAttribute('data-cursor', '1');
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      document.documentElement.removeAttribute('data-cursor');
      document.documentElement.removeAttribute('data-cursor-hover');
      document.documentElement.removeAttribute('data-cursor-down');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={anchorRef}
      className="insync-cursor-anchor pointer-events-none fixed left-0 top-0 z-[2147483647]"
      aria-hidden
    >
      <div className="insync-cursor-reticle">
        <span className="insync-cursor-reticle__arm insync-cursor-reticle__arm--h" />
        <span className="insync-cursor-reticle__arm insync-cursor-reticle__arm--v" />
        <span className="insync-cursor-reticle__core" />
      </div>
    </div>
  );
}
