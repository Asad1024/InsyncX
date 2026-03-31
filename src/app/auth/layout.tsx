import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';

function AuthBrandXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden auth-theme relative" style={{ background: 'var(--bg)' }}>
      <AuthLeftPanel />
      <div
        className="auth-right-panel flex flex-col items-center justify-start pt-6 pb-12 px-6 sm:px-10 overflow-y-auto relative"
        style={{
          background: 'linear-gradient(135deg, #0a0a0c 0%, #12121a 22%, #1a1a22 45%, #16161c 70%, #0c0c10 100%)',
          boxShadow: 'inset 0 0 200px rgba(74,144,226,0.06), inset 80px 0 120px rgba(74,144,226,0.05)',
          borderLeft: '1px solid rgba(74,144,226,0.2)',
        }}
      >
        {/* Compact brand row: X icon + InsyncX + Store */}
        <div
          className="w-full max-w-[400px] flex items-center gap-2 pb-4 mb-6 shrink-0 border-b"
          style={{
            borderBottomColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: '#4a90e2' }}>
            <AuthBrandXIcon />
          </span>
          <span className="font-display font-bold text-[14px]" style={{ color: 'var(--text)' }}>
            InsyncX
          </span>
          <span className="ml-auto font-sans uppercase tracking-wider text-[11px] text-[var(--text-4)] font-normal">
            Store
          </span>
        </div>
        <div className="w-full max-w-[400px] flex-1">{children}</div>
      </div>
    </div>
  );
}
