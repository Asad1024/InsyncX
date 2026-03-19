'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Store,
  CheckCircle,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { registerUser } from '@/actions/user.actions';

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  let n = 0;
  if (pwd.length >= 8) n++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) n++;
  if (/\d/.test(pwd)) n++;
  if (/[^a-zA-Z0-9]/.test(pwd)) n++;
  return Math.min(4, n) as 0 | 1 | 2 | 3 | 4;
}

const strengthLabel: Record<number, string> = {
  0: 'Weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

const strengthColor: Record<number, string> = {
  0: 'var(--surface3)',
  1: 'var(--red)',
  2: 'var(--amber)',
  3: 'var(--gold)',
  4: 'var(--green)',
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleStoreNameChange = (v: string) => {
    setStoreName(v);
    setStoreSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({
        name,
        email,
        password,
        role,
        storeName: role === 'VENDOR' ? storeName : undefined,
        storeSlug: role === 'VENDOR' ? storeSlug : undefined,
      });
      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push('/auth/login');
      router.refresh();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1
          className="font-display text-[40px] font-normal"
          style={{ color: 'var(--text)' }}
        >
          Create Account
        </h1>
        <p className="font-sans text-[14px] mt-2" style={{ color: 'var(--text-3)' }}>
          Join InsyncX and start shopping
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group mb-7">
          <label className="input-label mb-3">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className="relative border-2 rounded-[14px] p-5 text-center cursor-pointer transition-all duration-200 bg-[var(--surface)]"
              style={{
                borderColor: role === 'CUSTOMER' ? 'var(--gold)' : 'var(--line)',
                background: role === 'CUSTOMER' ? 'var(--gold-bg)' : 'var(--surface)',
                boxShadow: role === 'CUSTOMER' ? '0 0 0 3px rgba(212,168,67,0.10)' : 'none',
              }}
            >
              {role === 'CUSTOMER' && (
                <CheckCircle
                  className="absolute top-2.5 right-2.5 w-4 h-4"
                  style={{ color: 'var(--gold)' }}
                />
              )}
              <div
                className="w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{
                  background: role === 'CUSTOMER' ? 'var(--gold-bg)' : 'var(--surface3)',
                }}
              >
                <ShoppingBag
                  className="w-4 h-4"
                  style={{ color: role === 'CUSTOMER' ? 'var(--gold)' : 'var(--text-3)' }}
                />
              </div>
              <div className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>
                Shop
              </div>
              <div className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                Browse and buy products
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className="relative border-2 rounded-[14px] p-5 text-center cursor-pointer transition-all duration-200 bg-[var(--surface)]"
              style={{
                borderColor: role === 'VENDOR' ? 'var(--gold)' : 'var(--line)',
                background: role === 'VENDOR' ? 'var(--gold-bg)' : 'var(--surface)',
                boxShadow: role === 'VENDOR' ? '0 0 0 3px rgba(212,168,67,0.10)' : 'none',
              }}
            >
              {role === 'VENDOR' && (
                <CheckCircle
                  className="absolute top-2.5 right-2.5 w-4 h-4"
                  style={{ color: 'var(--gold)' }}
                />
              )}
              <div
                className="w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{
                  background: role === 'VENDOR' ? 'var(--gold-bg)' : 'var(--surface3)',
                }}
              >
                <Store
                  className="w-4 h-4"
                  style={{ color: role === 'VENDOR' ? 'var(--gold)' : 'var(--text-3)' }}
                />
              </div>
              <div className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>
                Sell
              </div>
              <div className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                Open your own store
              </div>
            </button>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="name" className="input-label">Name</label>
          <input
            id="name"
            type="text"
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="email" className="input-label">Email</label>
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
          <label htmlFor="password" className="input-label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input pr-11"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer"
              style={{ color: 'var(--text-4)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              className="input pr-11"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer"
              style={{ color: 'var(--text-4)' }}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-full transition-colors duration-200"
                style={{
                  background: i < strength ? strengthColor[strength] : 'var(--surface3)',
                }}
              />
            ))}
          </div>
          <p className="font-sans text-[11px] mt-1" style={{ color: strengthColor[strength] }}>
            {strengthLabel[strength]}
          </p>
        </div>

        {role === 'VENDOR' && (
          <div
            className="overflow-hidden transition-[max-height] duration-400 ease-out"
            style={{ maxHeight: 400 }}
          >
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
              <span
                className="font-sans text-[11px] uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-4)' }}
              >
                Store Details
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
            </div>
            <div className="input-group">
              <label htmlFor="storeName" className="input-label">Store Name</label>
              <input
                id="storeName"
                type="text"
                className="input"
                placeholder="Your Store Name"
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                required={role === 'VENDOR'}
              />
            </div>
            <div className="input-group">
              <label htmlFor="storeSlug" className="input-label">Store Slug</label>
              <input
                id="storeSlug"
                type="text"
                className="input"
                placeholder="your-store-slug"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                required={role === 'VENDOR'}
              />
              <p className="font-sans text-[11px] mt-1" style={{ color: 'var(--text-4)' }}>
                insyncx.store/store/{storeSlug || 'your-slug'}
              </p>
            </div>
          </div>
        )}

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

        <div className="flex items-start gap-2.5 mb-5">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreeTerms}
            onClick={() => setAgreeTerms((v) => !v)}
            className="mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            style={{
              borderColor: agreeTerms ? 'var(--gold)' : 'var(--line-md)',
              background: agreeTerms ? 'var(--gold)' : 'transparent',
            }}
          >
            {agreeTerms && <Check className="w-3 h-3" style={{ color: '#fff' }} strokeWidth={3} />}
          </button>
          <label htmlFor="terms" className="font-sans text-[13px] cursor-pointer" style={{ color: 'var(--text-3)' }}>
            I agree to the{' '}
            <Link href="/terms" className="hover:underline" style={{ color: 'var(--gold)' }}>
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: 'var(--gold)' }}>
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg disabled:opacity-80 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account…
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="text-center font-sans text-[13px] mt-6" style={{ color: 'var(--text-3)' }}>
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="hover:underline"
          style={{ color: 'var(--gold)' }}
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
