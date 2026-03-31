'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
import { registerUser, setPasswordAfterGoogle } from '@/actions/user.actions';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

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
  1: '#e85555',
  2: '#4a90e2',
  3: '#4caf7d',
  4: '#4caf7d',
};

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const completeMode = searchParams.get('complete') === '1';
  const fromGoogle = searchParams.get('from') === 'google';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (nameParam) {
      const parts = decodeURIComponent(nameParam).trim().split(/\s+/);
      if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(' '));
      } else if (parts.length === 1) {
        setFirstName(parts[0]);
      }
    }
  }, [searchParams]);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const needsPassword = (session?.user as { needsPassword?: boolean } | undefined)?.needsPassword;
  const showSetPasswordForm = completeMode && status === 'authenticated' && needsPassword;

  const handleStoreNameChange = (v: string) => {
    setStoreName(v);
    setStoreSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await setPasswordAfterGoogle(session.user.id, password);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push('/account');
      router.refresh();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
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
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        role,
        phone: phone.trim() || undefined,
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

  if (showSetPasswordForm && session?.user) {
    return (
      <>
        <div className="mb-6">
          <h1 className="font-display text-[32px] sm:text-[36px] font-light" style={{ color: 'var(--text)' }}>
            Set your password
          </h1>
          <p className="text-[14px] mt-2" style={{ color: 'var(--text-3)' }}>
            You signed in with Google. Choose a password to complete your account.
          </p>
        </div>
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Name</label>
            <p className="text-[14px] py-2" style={{ color: 'var(--text-2)' }}>{session.user.name ?? '—'}</p>
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <p className="text-[14px] py-2" style={{ color: 'var(--text-2)' }}>{session.user.email ?? '—'}</p>
          </div>
          <div className="input-group">
            <label htmlFor="complete-password" className="input-label">Password</label>
            <div className="relative">
              <input
                id="complete-password"
                type={showPassword ? 'text' : 'password'}
                className="input auth-input pr-12"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--text-4)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="complete-confirm" className="input-label">Confirm password</label>
            <div className="relative">
              <input
                id="complete-confirm"
                type={showConfirm ? 'text' : 'password'}
                className="input auth-input pr-12"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--text-4)' }}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 border" style={{ background: 'var(--red-bg)', borderColor: 'rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
              <span className="text-[13px]" style={{ color: 'var(--red)' }}>{error}</span>
            </div>
          )}
          <button
            type="submit"
            className="auth-submit-btn w-full py-4 rounded-xl text-[14px] font-semibold border-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting password…</> : 'Set password'}
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="font-display text-[26px] sm:text-[28px] font-bold" style={{ color: 'var(--text)' }}>
          Create account
        </h1>
        <p className="text-[14px] mt-2 font-normal" style={{ color: 'var(--text-3)' }}>
          Join <span className="font-semibold">Insync</span><span style={{ color: '#4a90e2' }}>X</span> and start shopping or selling
        </p>
        {fromGoogle && (
          <p className="text-[12px] mt-2" style={{ color: '#4a90e2' }}>
            Complete sign-up with a password below.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-0">
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label mb-2">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className="relative border-2 rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: role === 'CUSTOMER' ? 'var(--line-gold)' : 'var(--line)',
                background: role === 'CUSTOMER' ? 'var(--gold-bg)' : 'var(--surface2)',
                boxShadow: role === 'CUSTOMER' ? '0 0 0 2px rgba(74,144,226,0.15)' : 'none',
              }}
            >
              {role === 'CUSTOMER' && (
                <CheckCircle className="absolute top-2.5 right-2.5 w-4 h-4" style={{ color: 'var(--gold)' }} />
              )}
              <div
                className="w-9 h-9 rounded-full mx-auto mb-2.5 flex items-center justify-center"
                style={{ background: role === 'CUSTOMER' ? 'rgba(74,144,226,0.2)' : 'var(--surface3)' }}
              >
                <ShoppingBag className="w-4 h-4" style={{ color: role === 'CUSTOMER' ? 'var(--gold)' : 'var(--text-3)' }} />
              </div>
              <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Shop</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>Browse & buy</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className="relative border-2 rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: role === 'VENDOR' ? 'var(--line-gold)' : 'var(--line)',
                background: role === 'VENDOR' ? 'var(--gold-bg)' : 'var(--surface2)',
                boxShadow: role === 'VENDOR' ? '0 0 0 2px rgba(74,144,226,0.15)' : 'none',
              }}
            >
              {role === 'VENDOR' && (
                <CheckCircle className="absolute top-2.5 right-2.5 w-4 h-4" style={{ color: 'var(--gold)' }} />
              )}
              <div
                className="w-9 h-9 rounded-full mx-auto mb-2.5 flex items-center justify-center"
                style={{ background: role === 'VENDOR' ? 'rgba(74,144,226,0.2)' : 'var(--surface3)' }}
              >
                <Store className="w-4 h-4" style={{ color: role === 'VENDOR' ? 'var(--gold)' : 'var(--text-3)' }} />
              </div>
              <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Sell</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>Open your store</div>
            </button>
          </div>
        </div>

        <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="firstName" className="input-label">First name</label>
            <input
              id="firstName"
              type="text"
              className="input auth-input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="input-label">Last name</label>
            <input
              id="lastName"
              type="text"
              className="input auth-input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="email" className="input-label">Email</label>
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
          <label htmlFor="phone" className="input-label">Phone number</label>
          <input
            id="phone"
            type="tel"
            className="input auth-input"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password" className="input-label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input auth-input pr-12"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center border-0 bg-transparent cursor-pointer transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-4)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 transition-colors duration-200"
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: i < strength ? strengthColor[strength] : 'var(--surface3)',
                }}
              />
            ))}
          </div>
          <p className="text-[11px] mt-1" style={{ color: strengthColor[strength] }}>
            {strengthLabel[strength]}
          </p>
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword" className="input-label">Confirm password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              className="input auth-input pr-12"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center border-0 bg-transparent cursor-pointer transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-4)' }}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {role === 'VENDOR' && (
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>
              Store details
            </p>
            <p className="text-[12px] -mt-1" style={{ color: 'var(--text-4)' }}>
              Your store will be reviewed and go live after approval. You can add products once it’s approved.
            </p>
            <div className="input-group">
              <label htmlFor="storeName" className="input-label">Store name</label>
              <input
                id="storeName"
                type="text"
                className="input auth-input"
                placeholder="Your store name"
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                required={role === 'VENDOR'}
              />
            </div>
            <div className="input-group">
              <label htmlFor="storeSlug" className="input-label">Store URL slug</label>
              <input
                id="storeSlug"
                type="text"
                className="input auth-input"
                placeholder="your-store-slug"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                required={role === 'VENDOR'}
              />
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-4)' }}>
                insyncx.store/store/{storeSlug || 'your-slug'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3 border"
            style={{ background: 'var(--red-bg)', borderColor: 'rgba(239,68,68,0.25)' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
            <span className="text-[13px]" style={{ color: 'var(--red)' }}>{error}</span>
          </div>
        )}

        <div className="flex items-start gap-3 mt-5 mb-5 pt-4 pb-4">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded cursor-pointer shrink-0"
          />
          <label htmlFor="agreeTerms" className="text-[13px] cursor-pointer leading-snug" style={{ color: 'var(--text-3)' }}>
            I agree to the{' '}
            <Link href="/terms" className="hover:underline" style={{ color: 'var(--gold)' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: 'var(--gold)' }}>Privacy Policy</Link>
          </label>
        </div>

        <button
          type="submit"
          className="auth-submit-btn w-full py-4 text-[14px] border-0 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
      </div>
      <GoogleSignInButton callbackUrl="/auth/register" onConfigError={(m) => setError(m)} />

      <p className="text-center text-[13px] mt-8" style={{ color: 'var(--text-3)' }}>
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--gold)' }}>
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[240px] flex items-center justify-center font-sans text-[14px] text-[var(--text-3)]">
          Loading…
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
