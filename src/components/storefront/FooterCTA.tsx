'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export function FooterCTA() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      c.width = Math.floor(r.width * dpr);
      c.height = Math.floor(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        running = !!e?.isIntersecting;
      },
      { threshold: 0.1, rootMargin: '200px 0px 200px 0px' },
    );
    io.observe(c);

    const draw = () => {
      if (!running) {
        raf = window.requestAnimationFrame(draw);
        return;
      }
      const w = c.clientWidth;
      const h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // subtle particle field
      for (let i = 0; i < 110; i++) {
        const x = ((i * 131.1 + t * 18) % w + w) % w;
        const y = ((i * 93.7 + t * 12) % h + h) % h;
        const r = 0.8 + Math.sin(t + i) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle =
          i % 3 === 0 ? 'rgba(29,110,255,.8)' : i % 3 === 1 ? 'rgba(0,200,255,.5)' : 'rgba(100,180,255,.3)';
        ctx.fill();
      }

      t += 0.008;
      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return (
    <section data-reveal className="relative overflow-hidden text-center" style={{ padding: '160px 0' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(29,110,255,0.16), transparent 62%), linear-gradient(180deg, rgba(2,10,24,0.92), rgba(2,10,24,0.92))',
          opacity: 0.65,
        }}
      />

      <div data-reveal-child className="relative z-[2] px-6 md:px-10 lg:px-12">
        <h2 className="font-display font-black leading-[0.95]" style={{ fontSize: 'clamp(52px, 9vw, 130px)', letterSpacing: '-3px' }}>
          WANT TO
          <br />
          <span className="insync-gradient-text">SELL HERE?</span>
        </h2>
        <p className="mt-8 font-sans text-[15px] font-light leading-[1.7]" style={{ color: 'var(--muted)' }}>
          Join vendors already making money on INSYNC.
          <br />
          Setup in minutes. Full support.
        </p>

        <Link href="/vendor" data-cursor="interactive" className="btn btn-primary mt-10 inline-flex" style={{ padding: '18px 54px' }}>
          Become a Vendor →
        </Link>
      </div>
    </section>
  );
}

