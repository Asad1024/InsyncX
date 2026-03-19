import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <AuthLeftPanel />
      <div
        className="flex flex-col items-center justify-center py-12 px-6 sm:px-10 overflow-y-auto relative"
        style={{
          background: 'linear-gradient(135deg, #0a0a0c 0%, #12121a 22%, #1a1a22 45%, #16161c 70%, #0c0c10 100%), radial-gradient(ellipse 100% 80% at 70% 30%, rgba(212,168,67,0.08) 0%, transparent 50%)',
          boxShadow: 'inset 0 0 200px rgba(212,168,67,0.06), inset 100px 0 100px rgba(212,168,67,0.04), inset -80px 0 100px rgba(0,0,0,0.18)',
        }}
      >
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
