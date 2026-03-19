'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

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
      <div className="mb-10">
        <h1
          className="font-display text-[40px] font-normal"
          style={{ color: 'var(--text)' }}
        >
          Welcome Back
        </h1>
        <p className="font-sans text-[14px] mt-2" style={{ color: 'var(--text-3)' }}>
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            className="flex items-center gap-2 rounded-[10px] px-4 py-3 mb-5 border"
            style={{
              background: 'var(--red-bg)',
              borderColor: 'rgba(239,68,68,0.2)',
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
            <span className="font-sans text-[13px]" style={{ color: 'var(--red)' }}>
              {error}
            </span>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="input"
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
              className="input pr-11"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer transition-colors duration-150"
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
          <div className="flex justify-end mt-1.5">
            <Link
              href="/auth/forgot-password"
              className="font-sans text-[12px] transition-colors duration-150 hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg mt-2 disabled:opacity-80 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        <span className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
      </div>

      <p className="text-center font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="transition-colors duration-150 hover:underline"
          style={{ color: 'var(--gold)' }}
        >
          Create one
        </Link>
      </p>
    </>
  );
}
