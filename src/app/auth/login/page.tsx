'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="mb-6">
        <h1 className="font-display text-[30px] sm:text-[32px] font-bold" style={{ color: 'var(--text)' }}>
          Sign in
        </h1>
        <p className="text-[14px] mt-2 font-normal" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
          Enter your email and password to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3 border"
            style={{
              background: 'var(--red-bg)',
              borderColor: 'rgba(239,68,68,0.25)',
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
            <span className="text-[13px]" style={{ color: 'var(--red)' }}>
              {error}
            </span>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email" className="input-label">
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

        <div className="input-group">
          <label htmlFor="password" className="input-label">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center border-0 bg-transparent cursor-pointer transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-4)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <Link
              href="/auth/forgot-password"
              className="text-[12px] transition-colors hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn w-full py-4 text-[14px] border-0 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
      </div>

      <GoogleSignInButton callbackUrl={callbackUrl} />

      <p className="text-center text-[13px] mt-8" style={{ color: 'var(--text-3)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="font-medium hover:underline transition-colors"
          style={{ color: 'var(--gold)' }}
        >
          Create one
        </Link>
      </p>
    </>
  );
}
