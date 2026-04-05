'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';

export function AmbientSection({ videoSrc = '/brand-story.mp4' }: { videoSrc?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoOk, setVideoOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let running = true;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
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
    io.observe(canvas);

    const draw = (ts: number) => {
      if (!running) {
        raf = window.requestAnimationFrame(draw);
        return;
      }
      const dt = ts - last;
      last = ts;
      // Cap effective fps a bit for smoothness (avoid overwork on high refresh)
      const step = dt > 0 ? Math.min(2, dt / 16.67) : 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // base
      ctx.fillStyle = '#020a18';
      ctx.fillRect(0, 0, w, h);

      // gradient beams
      const beams = [
        { x: 0.15, c: 'rgba(29,110,255,.30)', o: 70 },
        { x: 0.4, c: 'rgba(0,100,255,.20)', o: 50 },
        { x: 0.65, c: 'rgba(0,200,255,.25)', o: 60 },
        { x: 0.88, c: 'rgba(29,60,255,.20)', o: 55 },
      ];
      beams.forEach((b, i) => {
        const bx = w * b.x + Math.sin(t * 0.25 + i) * b.o;
        const g = ctx.createRadialGradient(bx, h * 0.5, 0, bx, h * 0.5, h * 0.7);
        g.addColorStop(0, b.c);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      // wave lines
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        const yBase = h * (0.25 + i * 0.06);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 3) {
          const y = yBase + Math.sin(x * 0.004 + t * (0.3 + i * 0.06) + i * 1.1) * (50 + i * 20);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(0,150,255,.05)' : 'rgba(0,200,255,.05)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // floating particles
      for (let i = 0; i < 80; i++) {
        const px = Math.sin(t * 0.08 + i * 2.3) * w * 0.42 + w * 0.5;
        const py = Math.cos(t * 0.06 + i * 1.7) * h * 0.32 + h * 0.5;
        const r = 0.8 + Math.sin(t + i) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(29,110,255,.70)' : 'rgba(0,200,255,.50)';
        ctx.fill();
      }

      t += 0.014 * step;
      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = canvasRef.current?.closest('section') as HTMLElement | null;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const p = 1 - Math.max(0, Math.min(1, r.top / vh));
        const s = 0.95 + p * 0.05;
        el.style.transform = `scale(${s})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const stats = useMemo(
    () => [
      { n: '2.4K', l: 'Vendors' },
      { n: '50K+', l: 'Products' },
      { n: '180+', l: 'Countries' },
      { n: '4.9★', l: 'Rating' },
    ],
    [],
  );

  return (
    <SectionReveal
      stagger
      className="relative overflow-hidden"
      style={{
        height: '88vh',
        transformOrigin: 'center center',
        transition: 'transform 0.12s linear',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Optional video layer (falls back to canvas if missing) */}
      {videoOk && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18, filter: 'saturate(0.9) contrast(1.05)' }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src={videoSrc}
          onError={() => setVideoOk(false)}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg,rgba(2,10,24,1) 0%,rgba(2,10,24,.25) 30%,rgba(2,10,24,.25) 70%,rgba(2,10,24,1) 100%)',
        }}
      />

      {/* Scan frame + scan line */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 'min(92%, 860px)',
          maxWidth: 860,
          height: 'min(72%, 560px)',
          border: '1px solid rgba(29,110,255,.12)',
        }}
      >
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => {
          const common: React.CSSProperties = { position: 'absolute', width: 18, height: 18, borderColor: 'var(--blue)', borderStyle: 'solid' };
          const map: Record<typeof c, React.CSSProperties> = {
            tl: { top: -1, left: -1, borderWidth: '1.5px 0 0 1.5px' },
            tr: { top: -1, right: -1, borderWidth: '1.5px 1.5px 0 0' },
            bl: { bottom: -1, left: -1, borderWidth: '0 0 1.5px 1.5px' },
            br: { bottom: -1, right: -1, borderWidth: '0 1.5px 1.5px 0' },
          };
          return <div key={c} style={{ ...common, ...map[c] }} />;
        })}
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg,transparent,var(--blue),var(--cyan),var(--blue),transparent)',
            animation: 'scanMove 3s linear infinite',
          }}
        />
      </div>

      <div className="relative z-[2] flex h-full items-center justify-center px-6 text-center md:px-10 lg:px-12">
        <RevealItem className="mx-auto max-w-[980px]">
          <div
            className="inline-flex items-center gap-3 font-sans text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: 'var(--cyan)' }}
          >
            <span style={{ width: 40, height: 1, background: 'var(--cyan)' }} />
            Brand Story
            <span style={{ width: 40, height: 1, background: 'var(--cyan)' }} />
          </div>

          <h2
            className="mt-6 font-display font-black leading-[1.0]"
            style={{ fontSize: 'clamp(48px,7vw,100px)', letterSpacing: '-2px' }}
          >
            <span className="insync-gradient-text insync-amb-grad">WE ARE</span>
            <br />
            <span className="insync-amb-out" style={{ WebkitTextStroke: '2px rgba(238,242,255,.2)', color: 'transparent' }}>
              THE DROP
            </span>
            <br />
            <span className="insync-gradient-text insync-amb-grad">CULTURE.</span>
          </h2>

          <button
            type="button"
            data-cursor="interactive"
            className="mt-10 mx-auto flex items-center justify-center rounded-full"
            style={{
              width: 88,
              height: 88,
              border: '1px solid rgba(0,200,255,.3)',
              background: 'transparent',
              position: 'relative',
            }}
          >
            <span className="text-[26px]" style={{ color: 'rgba(238,242,255,0.85)', marginLeft: 4 }}>
              ▶
            </span>
            <span
              className="absolute rounded-full"
              style={{
                inset: -10,
                border: '1px solid rgba(0,200,255,.1)',
                animation: 'ringPulse 2.2s ease infinite',
              }}
            />
            <span
              className="absolute rounded-full"
              style={{
                inset: -22,
                border: '1px solid rgba(0,200,255,.05)',
                animation: 'ringPulse 2.2s ease infinite 0.5s',
              }}
            />
          </button>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-8 justify-items-center">
            {stats.map((s) => (
              <div key={s.l} className="text-center min-w-0">
                <div
                  className="font-display font-extrabold insync-gradient-text"
                  style={{ fontSize: 'clamp(28px, 4.2vw, 42px)', lineHeight: 1 }}
                >
                  {s.n}
                </div>
                <div
                  className="mt-2 font-sans text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </RevealItem>
      </div>

      <style jsx global>{`
        .insync-amb-grad {
          background-size: 220% 100%;
          animation: insyncAmbGradient 5s ease-in-out infinite;
        }
        .insync-amb-out {
          animation: insyncAmbOutline 2.8s ease-in-out infinite;
        }
        @keyframes insyncAmbGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes insyncAmbOutline {
          0%,
          100% {
            filter: drop-shadow(0 0 0 rgba(0, 200, 255, 0));
            opacity: 0.86;
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(0, 200, 255, 0.22));
            opacity: 1;
          }
        }
        @keyframes ringPulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes scanMove {
          0% {
            top: 0;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </SectionReveal>
  );
}

