import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="auth-theme relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[55fr_45fr]"
      style={{ background: 'var(--bg)' }}
    >
      <AuthLeftPanel />
      <div
        className="auth-right-panel relative flex min-h-0 flex-col items-center justify-start overflow-y-auto px-6 pb-12 pt-8 sm:px-10"
        style={{
          backgroundColor: 'var(--bg2)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'inset 0 0 120px rgba(29,110,255,0.04)',
        }}
      >
        <div className="auth-right-enter flex w-full max-w-[400px] flex-1 flex-col">
          <p className="mb-8 font-display text-[22px] font-bold tracking-tight">
            <span className="text-gradient-insync">InsyncX</span>
          </p>
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
