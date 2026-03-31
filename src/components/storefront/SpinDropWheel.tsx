'use client';

import { useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type WheelDesign = 'neon-glass' | 'holo-conic' | 'wireframe';

const PRIZES = [
  { label: '10% OFF', detail: 'On your next order' },
  { label: '₹150 OFF', detail: 'Min spend applies' },
  { label: 'FREE SHIPPING', detail: 'On this drop' },
  { label: 'BOGO', detail: 'Select categories' },
  { label: '15% OFF', detail: 'Official picks only' },
  { label: '₹250 OFF', detail: 'Limited time' },
  { label: 'MYSTERY GIFT', detail: 'At checkout' },
  { label: '5% OFF', detail: 'No minimum' },
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function SpinDropWheel() {
  const { toast } = useToast();
  const [design, setDesign] = useState<WheelDesign>('neon-glass');
  const [spinning, setSpinning] = useState(false);
  const [resultIdx, setResultIdx] = useState<number | null>(null);
  const rotationRef = useRef(0);

  const segments = PRIZES.length;
  const segmentAngle = 360 / segments;

  const wheelBg = useMemo(() => {
    // 8 segments, alternating INSYNC blues/cyans
    const stops: string[] = [];
    for (let i = 0; i < segments; i++) {
      const c = i % 2 === 0 ? 'rgba(29,110,255,0.95)' : 'rgba(0,200,255,0.85)';
      const start = i * segmentAngle;
      const end = (i + 1) * segmentAngle;
      stops.push(`${c} ${start}deg ${end}deg`);
    }
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  }, [segments, segmentAngle]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const idx = Math.floor(Math.random() * segments);

    // Pointer is at top (0deg). Our conic starts at -90deg; keep math stable:
    // Put chosen segment center under pointer.
    const targetCenter = idx * segmentAngle + segmentAngle / 2;
    const extraTurns = 6 + Math.floor(Math.random() * 3); // 6–8

    const current = rotationRef.current % 360;
    const delta = 360 - ((current + targetCenter) % 360);
    const next = rotationRef.current + extraTurns * 360 + delta;

    rotationRef.current = next;
    setResultIdx(idx);

    window.setTimeout(() => {
      setSpinning(false);
      const prize = PRIZES[idx];
      toast({ title: `Drop unlocked: ${prize.label}`, description: prize.detail, variant: 'success' });
    }, 2200);
  };

  const wheelBaseStyle: React.CSSProperties = {
    width: 'min(420px, 100%)',
    aspectRatio: '1/1',
    borderRadius: '9999px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(29,110,255,0.22)',
    background: 'rgba(6,18,50,0.55)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 44px rgba(29,110,255,0.16)',
  };

  const wheelFaceStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 10,
    borderRadius: '9999px',
    background: design === 'holo-conic' ? wheelBg : 'rgba(6,18,50,0.35)',
    transform: `rotate(${rotationRef.current}deg)`,
    transition: spinning ? 'transform 2.2s cubic-bezier(0.16,1,0.3,1)' : 'transform 0.4s ease',
  };

  const centerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 130,
    height: 130,
    transform: 'translate(-50%, -50%)',
    borderRadius: 9999,
    background: 'rgba(2,10,24,0.78)',
    border: '1px solid rgba(29,110,255,0.22)',
    backdropFilter: 'blur(18px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 6,
    boxShadow: '0 0 34px rgba(0,200,255,0.12)',
  };

  const pointerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: -4,
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: '18px solid rgba(0,200,255,0.95)',
    filter: 'drop-shadow(0 0 14px rgba(0,200,255,0.35))',
    zIndex: 5,
  };

  const labelRing = useMemo(() => {
    // keep labels upright while wheel rotates
    return PRIZES.map((p, i) => {
      const a = i * segmentAngle + segmentAngle / 2;
      return (
        <div
          key={p.label}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) rotate(${a}deg) translateY(-148px) rotate(${-a - rotationRef.current}deg)`,
            transformOrigin: 'center',
            width: 160,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div className="font-display text-[12px] font-black tracking-[-0.04em]" style={{ color: 'rgba(238,242,255,0.95)' }}>
            {p.label}
          </div>
        </div>
      );
    });
  }, [segmentAngle]);

  const overlayStyle = useMemo<React.CSSProperties>(() => {
    if (design === 'neon-glass') {
      return {
        position: 'absolute',
        inset: 10,
        borderRadius: '9999px',
        background:
          'radial-gradient(circle at 30% 25%, rgba(0,200,255,0.18), transparent 45%), radial-gradient(circle at 70% 80%, rgba(29,110,255,0.18), transparent 48%)',
        pointerEvents: 'none',
        zIndex: 2,
      };
    }
    if (design === 'wireframe') {
      return {
        position: 'absolute',
        inset: 10,
        borderRadius: '9999px',
        background:
          'radial-gradient(circle, rgba(29,110,255,0.12) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0.8,
      };
    }
    return {
      position: 'absolute',
      inset: 10,
      borderRadius: '9999px',
      background:
        'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent)',
      pointerEvents: 'none',
      zIndex: 2,
      mixBlendMode: 'screen',
      opacity: 0.9,
    };
  }, [design]);

  const result = resultIdx != null ? PRIZES[clamp(resultIdx, 0, PRIZES.length - 1)] : null;

  return (
    <section
      data-reveal
      data-reveal-stagger="1"
      className="py-[100px] px-6 md:px-10 lg:px-12 bg-[var(--bg)] border-t"
      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div className="max-w-[var(--content-max)] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div data-reveal-child>
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
            <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Spin the drop
          </p>
          <h2
            className="mt-3 font-display font-extrabold leading-[1.05]"
            style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}
          >
            Drop <span className="insync-gradient-text italic">Wheel</span>
          </h2>
          <p className="mt-4 font-sans text-[15px] leading-[1.9]" style={{ color: 'var(--muted)', maxWidth: 520 }}>
            Choose a style, spin the wheel, and unlock a drop reward. This is a frontend-only experience (no purchase logic is changed).
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {([
              { id: 'neon-glass', label: 'Design 1' },
              { id: 'holo-conic', label: 'Design 2' },
              { id: 'wireframe', label: 'Design 3' },
            ] as const).map((t) => {
              const active = design === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  data-cursor="interactive"
                  onClick={() => setDesign(t.id)}
                  className="px-4 py-2 rounded-full border font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-200"
                  style={{
                    color: active ? 'var(--white)' : 'rgba(238,242,255,0.72)',
                    background: active ? 'linear-gradient(135deg, var(--blue), var(--blue-mid))' : 'rgba(6,18,50,0.45)',
                    borderColor: active ? 'rgba(29,110,255,0.35)' : 'rgba(29,110,255,0.18)',
                    boxShadow: active ? '0 0 28px rgba(29,110,255,0.35)' : 'none',
                    backdropFilter: 'blur(18px)',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center gap-4">
            <button
              type="button"
              data-cursor="interactive"
              onClick={spin}
              disabled={spinning}
              className="rounded-[8px] px-6 py-3 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))',
                boxShadow: '0 0 28px rgba(29,110,255,0.45)',
                color: 'var(--white)',
              }}
            >
              {spinning ? 'Spinning…' : 'Spin'}
            </button>
            <div className="font-sans text-[13px]" style={{ color: 'rgba(238,242,255,0.72)' }}>
              {result ? (
                <>
                  Last: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{result.label}</span>
                </>
              ) : (
                <>Last: —</>
              )}
            </div>
          </div>
        </div>

        <div data-reveal-child className="flex justify-center lg:justify-end">
          <div style={wheelBaseStyle}>
            <div style={pointerStyle} />

            <div
              style={{
                ...wheelFaceStyle,
                background:
                  design === 'holo-conic'
                    ? wheelBg
                    : 'linear-gradient(135deg, rgba(29,110,255,0.10), rgba(0,200,255,0.06))',
              }}
            />

            {/* Segment dividers for designs 1 & 3 */}
            {design !== 'holo-conic' && (
              <div
                className="absolute inset-[10px] rounded-full"
                style={{
                  transform: `rotate(${rotationRef.current}deg)`,
                  transition: spinning ? 'transform 2.2s cubic-bezier(0.16,1,0.3,1)' : 'transform 0.4s ease',
                  background:
                    'conic-gradient(from -90deg, rgba(29,110,255,0.75) 0deg 40deg, rgba(0,200,255,0.65) 40deg 90deg, rgba(29,110,255,0.75) 90deg 140deg, rgba(0,200,255,0.65) 140deg 180deg, rgba(29,110,255,0.75) 180deg 230deg, rgba(0,200,255,0.65) 230deg 270deg, rgba(29,110,255,0.75) 270deg 320deg, rgba(0,200,255,0.65) 320deg 360deg)',
                  opacity: design === 'wireframe' ? 0.22 : 0.5,
                }}
              />
            )}

            <div style={overlayStyle} />

            {/* Labels */}
            <div
              className="absolute inset-[10px] rounded-full"
              style={{
                transform: `rotate(${rotationRef.current}deg)`,
                transition: spinning ? 'transform 2.2s cubic-bezier(0.16,1,0.3,1)' : 'transform 0.4s ease',
                zIndex: 3,
              }}
            >
              {labelRing}
            </div>

            {/* Center */}
            <div style={centerStyle}>
              <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(238,242,255,0.65)' }}>
                INSYNC
              </div>
              <div className="font-display text-[18px] font-black insync-gradient-text">DROP</div>
              <div className="font-sans text-[10px] uppercase tracking-[0.22em]" style={{ color: 'rgba(238,242,255,0.55)' }}>
                spin
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

