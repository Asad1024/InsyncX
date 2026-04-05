import { useEffect } from 'react';

let lockCount = 0;
let saved: { html: string; body: string; pad: string } = { html: '', body: '', pad: '' };

/**
 * Locks document scroll while overlays/drawers are open. Reference-counted so
 * multiple overlays (e.g. cart + rare combinations) do not unlock prematurely.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;

    if (lockCount === 0) {
      const html = document.documentElement;
      const body = document.body;
      saved = {
        html: html.style.overflow,
        body: body.style.overflow,
        pad: body.style.paddingRight,
      };
      const scrollbarW = window.innerWidth - html.clientWidth;
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      if (scrollbarW > 0) {
        body.style.paddingRight = `${scrollbarW}px`;
      }
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.documentElement.style.overflow = saved.html;
        document.body.style.overflow = saved.body;
        document.body.style.paddingRight = saved.pad;
      }
    };
  }, [locked]);
}
