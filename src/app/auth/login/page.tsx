'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!error) return;
    const f = formRef.current;
    if (!f) return;
    f.classList.remove('insync-shake');
    void f.offsetWidth;
    f.classList.add('insync-shake');
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }
      if (!res?.ok) {
        setLoading(false);
        return;
      }
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role;
      let dest = callbackUrl;
      if (callbackUrl === '/' || callbackUrl.startsWith('/auth')) {
        if (role === 'ADMIN') dest = '/admin';
        else if (role === 'VENDOR') dest = '/vendor';
        else if (role === 'CUSTOMER') dest = '/account';
      }
      router.push(dest);
      router.refresh();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-stagger-fade mb-8" style={{ animationDelay: '0.1s' }}>
        <h1 className="font-display text-[36px] font-bold leading-tight text-white" style={{ fontWeight: 700 }}>
          Sign in
        </h1>
        <p className="mt-2 font-sans text-[14px] font-normal text-[var(--muted)]">
          Enter your email and password to continue
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-0">
        {error && (
          <div
            className="auth-stagger-fade mb-5 flex items-center gap-2.5 rounded-[10px] border border-[rgba(255,77,77,0.35)] px-4 py-3"
            style={{ animationDelay: '0.15s', background: 'rgba(255,77,77,0.08)' }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-[#ff6b6b]" />
            <span className="auth-error-text m-0">{error}</span>
          </div>
        )}

        <div className="auth-stagger-fade input-group" style={{ animationDelay: '0.3s' }}>
          <label htmlFor="email" className="insync-field-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="input auth-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-stagger-fade input-group" style={{ animationDelay: '0.4s' }}>
          <label htmlFor="password" className="insync-field-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input auth-input pr-12"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent transition-all duration-200 ease-out hover:bg-[var(--glass)] ${
                showPassword ? 'text-[var(--cyan)]' : 'text-[var(--muted)]'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="font-sans text-[12px] text-[var(--cyan)] transition-all duration-200 ease-out hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="auth-stagger-fade pt-2" style={{ animationDelay: '0.5s' }}>
          <button
            type="submit"
            className="auth-submit-btn flex w-full items-center justify-center gap-2 border-0 px-4 py-4 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </form>

      <div className="auth-stagger-fade my-8 flex items-center gap-4" style={{ animationDelay: '0.52s' }}>
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="font-sans text-[12px] text-[var(--muted)]">or</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="auth-stagger-fade" style={{ animationDelay: '0.54s' }}>
        <GoogleSignInButton callbackUrl={callbackUrl} onConfigError={(m) => setError(m)} />
      </div>

      <p className="auth-stagger-fade mt-8 text-center font-sans text-[13px] text-[var(--muted)]" style={{ animationDelay: '0.56s' }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-medium text-[var(--cyan)] transition-all duration-200 hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[240px] items-center justify-center font-sans text-[14px] text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
