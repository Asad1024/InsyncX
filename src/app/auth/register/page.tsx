'use client';

import { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShoppingBag, Store, Check, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
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
  1: '#ff6b6b',
  2: 'var(--blue)',
  3: 'var(--cyan)',
  4: 'var(--cyan)',
};

function stagger(i: number) {
  return { animationDelay: `${0.12 + i * 0.08}s` } as const;
}

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
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (nameParam) {
      const parts = decodeURIComponent(nameParam).trim().split(/\s+/);
      if (parts.length >= 2) {
        setFirstName(parts[0]!);
        setLastName(parts.slice(1).join(' '));
      } else if (parts.length === 1) {
        setFirstName(parts[0]!);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!error) return;
    const f = formRef.current;
    if (!f) return;
    f.classList.remove('insync-shake');
    void f.offsetWidth;
    f.classList.add('insync-shake');
  }, [error]);

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
    let si = 0;
    return (
      <>
        <div className="auth-stagger-fade mb-6" style={stagger(si++)}>
          <h1 className="font-display text-[32px] font-bold text-white sm:text-[36px]" style={{ fontWeight: 700 }}>
            Set your password
          </h1>
          <p className="mt-2 font-sans text-[14px] text-[var(--muted)]">
            You signed in with Google. Choose a password to complete your account.
          </p>
        </div>
        <form ref={formRef} onSubmit={handleSetPassword} className="space-y-0">
          <div className="auth-stagger-fade input-group" style={stagger(si++)}>
            <span className="insync-field-label">Name</span>
            <p className="font-sans text-[14px] py-2 text-[var(--white)]">{session.user.name ?? '—'}</p>
          </div>
          <div className="auth-stagger-fade input-group" style={stagger(si++)}>
            <span className="insync-field-label">Email</span>
            <p className="font-sans text-[14px] py-2 text-[var(--white)]">{session.user.email ?? '—'}</p>
          </div>
          <div className="auth-stagger-fade input-group" style={stagger(si++)}>
            <label htmlFor="complete-password" className="insync-field-label">
              Password
            </label>
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
                className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent transition-all duration-200 hover:bg-[var(--glass)] ${
                  showPassword ? 'text-[var(--cyan)]' : 'text-[var(--muted)]'
                }`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="auth-stagger-fade input-group" style={stagger(si++)}>
            <label htmlFor="complete-confirm" className="insync-field-label">
              Confirm password
            </label>
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
                className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent transition-all duration-200 hover:bg-[var(--glass)] ${
                  showConfirm ? 'text-[var(--cyan)]' : 'text-[var(--muted)]'
                }`}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div
              className="auth-stagger-fade mb-4 flex items-center gap-2.5 rounded-[10px] border border-[rgba(255,77,77,0.35)] px-4 py-3"
              style={{ ...stagger(si++), background: 'rgba(255,77,77,0.08)' }}
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-[#ff6b6b]" />
              <span className="auth-error-text m-0">{error}</span>
            </div>
          )}
          <div className="auth-stagger-fade pt-2" style={stagger(si++)}>
            <button
              type="submit"
              className="auth-submit-btn flex w-full items-center justify-center gap-2 border-0 px-4 py-4 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Setting password…
                </>
              ) : (
                'Set password'
              )}
            </button>
          </div>
        </form>
      </>
    );
  }

  let i = 0;
  return (
    <>
      <div className="auth-stagger-fade mb-5" style={stagger(i++)}>
        <h1 className="font-display text-[28px] font-bold text-white sm:text-[32px]" style={{ fontWeight: 700 }}>
          Create account
        </h1>
        <p className="mt-2 font-sans text-[14px] font-normal text-[var(--muted)]">
          Join <span className="text-gradient-insync font-semibold">InsyncX</span> and start shopping or selling
        </p>
        {fromGoogle && (
          <p className="mt-2 font-sans text-[12px] text-[var(--cyan)]">Complete sign-up with a password below.</p>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-0">
        <div className="auth-stagger-fade input-group" style={stagger(i++)}>
          <span className="insync-field-label mb-2">I want to</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`relative rounded-[12px] border p-4 text-center transition-all duration-300 ease-out sm:p-5 ${
                role === 'CUSTOMER'
                  ? 'border-[var(--blue)] bg-[rgba(29,110,255,0.15)] shadow-[0_0_20px_rgba(29,110,255,0.2)]'
                  : 'border-[var(--border)] bg-[var(--card-bg)]'
              }`}
            >
              <Check
                className={`absolute right-2.5 top-2.5 h-4 w-4 text-[var(--cyan)] transition-transform duration-200 ${
                  role === 'CUSTOMER' ? 'scale-100' : 'scale-0'
                }`}
                strokeWidth={3}
              />
              <div
                className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300"
                style={{
                  background: 'rgba(29,110,255,0.2)',
                  boxShadow: '0 0 16px rgba(29,110,255,0.25)',
                }}
              >
                <ShoppingBag className="h-4 w-4 text-[var(--blue)]" />
              </div>
              <div className="font-sans text-[13px] font-semibold text-white">Shop</div>
              <div className="mt-0.5 font-sans text-[11px] text-[var(--muted)]">Browse & buy</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className={`relative rounded-[12px] border p-4 text-center transition-all duration-300 ease-out sm:p-5 ${
                role === 'VENDOR'
                  ? 'border-[var(--blue)] bg-[rgba(29,110,255,0.15)] shadow-[0_0_20px_rgba(29,110,255,0.2)]'
                  : 'border-[var(--border)] bg-[var(--card-bg)]'
              }`}
            >
              <Check
                className={`absolute right-2.5 top-2.5 h-4 w-4 text-[var(--cyan)] transition-transform duration-200 ${
                  role === 'VENDOR' ? 'scale-100' : 'scale-0'
                }`}
                strokeWidth={3}
              />
              <div
                className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300"
                style={{
                  background: 'rgba(29,110,255,0.2)',
                  boxShadow: '0 0 16px rgba(29,110,255,0.25)',
                }}
              >
                <Store className="h-4 w-4 text-[var(--blue)]" />
              </div>
              <div className="font-sans text-[13px] font-semibold text-white">Sell</div>
              <div className="mt-0.5 font-sans text-[11px] text-[var(--muted)]">Open your store</div>
            </button>
          </div>
        </div>

        <div
          className="auth-stagger-fade my-5 border-t border-[var(--border)] pt-5"
          style={stagger(i++)}
        />

        <div className="auth-stagger-fade grid grid-cols-2 gap-3" style={stagger(i++)}>
          <div>
            <label htmlFor="firstName" className="insync-field-label">
              First name
            </label>
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
            <label htmlFor="lastName" className="insync-field-label">
              Last name
            </label>
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

        <div className="auth-stagger-fade input-group" style={stagger(i++)}>
          <label htmlFor="email" className="insync-field-label">
            Email
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

        <div className="auth-stagger-fade input-group" style={stagger(i++)}>
          <label htmlFor="phone" className="insync-field-label">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            className="input auth-input"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div
          className="auth-stagger-fade my-5 border-t border-[var(--border)] pt-1"
          style={stagger(i++)}
        />

        <div className="auth-stagger-fade input-group" style={stagger(i++)}>
          <label htmlFor="password" className="insync-field-label">
            Password
          </label>
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
              className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent transition-all duration-200 hover:bg-[var(--glass)] ${
                showPassword ? 'text-[var(--cyan)]' : 'text-[var(--muted)]'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex-1 transition-colors duration-200"
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: idx < strength ? strengthColor[strength] : 'var(--surface3)',
                }}
              />
            ))}
          </div>
          <p className="mt-1 font-sans text-[11px]" style={{ color: strengthColor[strength] }}>
            {strengthLabel[strength]}
          </p>
        </div>

        <div className="auth-stagger-fade input-group" style={stagger(i++)}>
          <label htmlFor="confirmPassword" className="insync-field-label">
            Confirm password
          </label>
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
              className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent transition-all duration-200 hover:bg-[var(--glass)] ${
                showConfirm ? 'text-[var(--cyan)]' : 'text-[var(--muted)]'
              }`}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {role === 'VENDOR' && (
          <div
            className="auth-stagger-fade mt-4 space-y-3 border-t border-[var(--border)] pt-4"
            style={stagger(i++)}
          >
            <p className="insync-field-label !mb-1">Store details</p>
            <p className="font-sans text-[12px] text-[var(--muted)]">
              Your store will be reviewed and go live after approval. You can add products once it’s approved.
            </p>
            <div className="input-group !mb-3">
              <label htmlFor="storeName" className="insync-field-label">
                Store name
              </label>
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
              <label htmlFor="storeSlug" className="insync-field-label">
                Store URL slug
              </label>
              <input
                id="storeSlug"
                type="text"
                className="input auth-input"
                placeholder="your-store-slug"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                required={role === 'VENDOR'}
              />
              <p className="mt-1.5 font-sans text-[11px] text-[var(--muted)]">
                insyncx.store/store/{storeSlug || 'your-slug'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="auth-stagger-fade mt-4 flex items-center gap-2.5 rounded-[10px] border border-[rgba(255,77,77,0.35)] px-4 py-3"
            style={{ background: 'rgba(255,77,77,0.08)' }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-[#ff6b6b]" />
            <span className="auth-error-text m-0">{error}</span>
          </div>
        )}

        <div className="auth-stagger-fade my-6 border-t border-[var(--border)] pt-6" style={stagger(i++)}>
          <label htmlFor="agreeTerms" className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="peer sr-only"
            />
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-transparent transition-all duration-200 ease-out peer-checked:border-[var(--blue)] peer-checked:bg-[var(--blue)]"
            >
              <Check
                className={`h-3.5 w-3.5 text-white transition-transform duration-200 ease-out ${
                  agreeTerms ? 'scale-100' : 'scale-0'
                }`}
                strokeWidth={3}
              />
            </span>
            <span className="font-sans text-[13px] leading-snug text-[var(--muted)]">
              I agree to the{' '}
              <Link href="/terms" className="text-[var(--cyan)] transition-colors hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[var(--cyan)] transition-colors hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        <div className="auth-stagger-fade pb-2" style={stagger(i++)}>
          <button
            type="submit"
            className="auth-submit-btn flex w-full items-center justify-center gap-2 border-0 px-4 py-4 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </form>

      <div className="auth-stagger-fade my-8 flex items-center gap-4" style={stagger(i++)}>
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="font-sans text-[12px] text-[var(--muted)]">or</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="auth-stagger-fade" style={stagger(i++)}>
        <GoogleSignInButton callbackUrl="/auth/register" onConfigError={(m) => setError(m)} />
      </div>

      <p className="auth-stagger-fade mt-8 text-center font-sans text-[13px] text-[var(--muted)]" style={stagger(i++)}>
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-[var(--cyan)] transition-colors hover:underline">
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
        <div className="flex min-h-[240px] items-center justify-center font-sans text-[14px] text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
