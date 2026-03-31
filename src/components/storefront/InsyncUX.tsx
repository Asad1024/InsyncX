'use client';

import { useEffect, useMemo, useRef } from 'react';

type RevealEl = HTMLElement & { __insyncRevealed?: boolean };

function isInteractive(el: Element | null) {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea') return true;
  const role = el.getAttribute('role');
  if (role === 'button' || role === 'link') return true;
  if ((el as HTMLElement).dataset?.cursor === 'interactive') return true;
  return false;
}

export function InsyncUX() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const rafRef = useRef<number | null>(null);
  const pos = useMemo(() => ({ x: 0, y: 0, rx: 0, ry: 0 }), []);

  useEffect(() => {
    // Scroll reveal
    const els = Array.from(document.querySelectorAll('[data-reveal]')) as RevealEl[];
    els.forEach((el) => el.classList.add('insync-reveal'));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as RevealEl;
          if (!e.isIntersecting || el.__insyncRevealed) continue;
          el.__insyncRevealed = true;
          el.classList.add('insync-reveal-in');

          // Stagger children if requested
          if (el.dataset.revealStagger === '1') {
            const kids = Array.from(el.querySelectorAll('[data-reveal-child]')) as HTMLElement[];
            kids.forEach((kid, i) => {
              kid.style.transitionDelay = `${Math.min(8, i) * 0.1}s`;
              kid.classList.add('insync-reveal', 'insync-reveal-in');
            });
          }
        }
      },
      { threshold: 0.18, rootMargin: '120px 0px -80px 0px' },
    );
    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Custom cursor (desktop only)
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const finePointer = window.matchMedia?.('(pointer: fine)')?.matches;
    if (reduce || !finePointer) return;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        // ring follows with delay
        pos.rx += (pos.x - pos.rx) * 0.18;
        pos.ry += (pos.y - pos.ry) * 0.18;
        dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        ring.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0)`;
      });
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const interactive = isInteractive(target) || !!target?.closest?.('a,button,[role="button"],[role="link"],[data-cursor="interactive"]');
      document.documentElement.toggleAttribute('data-cursor-hover', interactive);
    };

    const onDown = () => document.documentElement.setAttribute('data-cursor-down', '1');
    const onUp = () => document.documentElement.removeAttribute('data-cursor-down');

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    document.documentElement.setAttribute('data-cursor', '1');
    return () => {
      document.documentElement.removeAttribute('data-cursor');
      document.documentElement.removeAttribute('data-cursor-hover');
      document.documentElement.removeAttribute('data-cursor-down');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [pos]);

  return (
    <>
      <div ref={dotRef} className="insync-cursor-dot" aria-hidden />
      <div ref={ringRef} className="insync-cursor-ring" aria-hidden />
    </>
  );
}

