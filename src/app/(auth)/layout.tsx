import { CheckCircle, Store, Shield } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Left: brand panel */}
      <div
        className="hidden md:flex flex-col items-center justify-center py-16 px-12 relative overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--line)',
          padding: '64px 48px',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(212,168,67,0.06) 0%, transparent 60%)',
          }}
          aria-hidden
        />
        <div className="relative z-[1] text-center">
          <h1
            className="font-display text-[64px] font-light tracking-[0.04em]"
            style={{ color: 'var(--text)' }}
          >
            InsyncX
          </h1>
          <p
            className="font-display text-[22px] italic mt-2"
            style={{ color: 'var(--gold)' }}
          >
            Unique Fashion for Every Identity
          </p>
          <div
            className="w-12 h-px mx-auto my-8"
            style={{ background: 'var(--line)' }}
          />
          <p
            className="font-sans text-[14px] max-w-[320px] mx-auto leading-[1.7]"
            style={{ color: 'var(--text-3)' }}
          >
            Multi-vendor marketplace curated for bold and authentic self-expression.
          </p>
          <div className="flex flex-col items-center gap-2.5 mt-10">
            <div
              className="flex items-center gap-2.5 rounded-full px-4 py-2 w-fit border"
              style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
            >
              <CheckCircle className="w-[14px] h-[14px] shrink-0" style={{ color: 'var(--gold)' }} />
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
                500+ Curated Products
              </span>
            </div>
            <div
              className="flex items-center gap-2.5 rounded-full px-4 py-2 w-fit border"
              style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
            >
              <Store className="w-[14px] h-[14px] shrink-0" style={{ color: 'var(--gold)' }} />
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
                Multi-Vendor Platform
              </span>
            </div>
            <div
              className="flex items-center gap-2.5 rounded-full px-4 py-2 w-fit border"
              style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
            >
              <Shield className="w-[14px] h-[14px] shrink-0" style={{ color: 'var(--gold)' }} />
              <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
                Secure Checkout
              </span>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-12 text-center">
          <p className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>
            © 2025 InsyncX. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div
        className="flex items-center justify-center py-16 px-12 overflow-y-auto"
        style={{ background: 'var(--bg)' }}
      >
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
