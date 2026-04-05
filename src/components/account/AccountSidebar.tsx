'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  User,
  Store,
  ArrowUpRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@prisma/client';

interface AccountSidebarProps {
  user: {
    name: string | null;
    email: string | null;
    role: UserRole;
    image?: string | null;
  };
}

const accountNav = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
] as const;
const settingsNav = [{ href: '/account/profile', label: 'Profile', icon: User }] as const;

function NavIconLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        'group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ease-out md:h-12 md:w-12',
        active
          ? 'border-[rgba(29,110,255,0.45)] bg-[rgba(29,110,255,0.18)] text-[var(--cyan)] shadow-[0_0_20px_rgba(29,110,255,0.2)]'
          : 'border-transparent text-[var(--muted)] hover:border-white/10 hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--white)]'
      )}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 hidden h-[55%] w-[3px] -translate-y-1/2 rounded-r-full md:block"
          style={{
            background: 'linear-gradient(to bottom, var(--blue), var(--cyan))',
          }}
          aria-hidden
        />
      )}
      <Icon className="relative z-[1] h-[18px] w-[18px] md:h-5 md:w-5" strokeWidth={1.75} />
      <span
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/12 bg-[rgba(4,12,28,0.92)] px-2.5 py-1 font-sans text-[11px] font-medium text-[var(--white)] opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-[12px] transition-opacity duration-150 group-hover:opacity-100 md:block"
        role="tooltip"
      >
        {label}
      </span>
    </Link>
  );
}

export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const initials = (user.name ?? 'U').slice(0, 2).toUpperCase();

  return (
    <aside
      className="account-sidebar-enter sticky top-[var(--nav-h)] z-30 flex w-full flex-shrink-0 flex-row items-center gap-1.5 overflow-x-auto overflow-y-hidden border-b border-white/10 bg-[rgba(4,12,28,0.32)] px-3 py-2.5 backdrop-blur-[18px] [-ms-overflow-style:none] [scrollbar-width:none] md:h-[calc(100dvh-var(--nav-h))] md:w-[var(--account-w)] md:flex-col md:items-center md:gap-2 md:overflow-y-auto md:overflow-x-hidden md:border-b-0 md:border-r md:border-white/10 md:px-2 md:py-6 [&::-webkit-scrollbar]:hidden"
      style={{ WebkitBackdropFilter: 'blur(18px)' }}
    >
      <div className="flex shrink-0 items-center md:mb-2 md:flex-col">
        <div
          className="h-10 w-10 overflow-hidden rounded-full border border-[rgba(29,110,255,0.35)] shadow-[0_0_20px_rgba(29,110,255,0.15)] transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(0,200,255,0.25)] md:h-11 md:w-11"
          title={user.name ?? 'Account'}
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[rgba(29,110,255,0.15)] font-display text-[13px] font-bold text-gradient-insync">
              {initials}
            </div>
          )}
        </div>
      </div>

      <div className="mx-1 hidden h-px w-8 bg-white/10 md:block" aria-hidden />

      <nav className="flex flex-row items-center gap-1.5 md:flex-col md:gap-2" aria-label="Account">
        {accountNav.map(({ href, label, icon }) => {
          const isActive =
            href === '/account' ? pathname === '/account' : pathname.startsWith(href);
          return <NavIconLink key={href} href={href} label={label} icon={icon} active={isActive} />;
        })}
      </nav>

      <div className="mx-1 hidden h-px w-8 bg-white/10 md:block" aria-hidden />

      <nav className="flex flex-row items-center gap-1.5 md:flex-col md:gap-2" aria-label="Settings">
        {settingsNav.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return <NavIconLink key={href} href={href} label={label} icon={icon} active={isActive} />;
        })}
      </nav>

      <div className="hidden flex-1 md:block" aria-hidden />

      <div className="ml-auto flex flex-row items-center gap-1.5 md:ml-0 md:flex-col md:gap-2 md:border-t md:border-white/10 md:pt-4">
        {user.role === 'VENDOR' && (
          <Link
            href="/vendor"
            title="Vendor Portal"
            className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--muted)] transition-all duration-200 hover:border-white/10 hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--white)] md:h-12 md:w-12"
          >
            <Store className="h-[18px] w-[18px] md:h-5 md:w-5" strokeWidth={1.75} />
            <ArrowUpRight className="pointer-events-none absolute right-0.5 top-0.5 h-2.5 w-2.5 opacity-50" />
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/12 bg-[rgba(4,12,28,0.92)] px-2.5 py-1 font-sans text-[11px] text-[var(--white)] opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 md:block">
              Vendor
            </span>
          </Link>
        )}
        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            title="Admin Panel"
            className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--muted)] transition-all duration-200 hover:border-white/10 hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--white)] md:h-12 md:w-12"
          >
            <LayoutDashboard className="h-[18px] w-[18px] md:h-5 md:w-5" strokeWidth={1.75} />
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/12 bg-[rgba(4,12,28,0.92)] px-2.5 py-1 font-sans text-[11px] text-[var(--white)] opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 md:block">
              Admin
            </span>
          </Link>
        )}
        <button
          type="button"
          title="Sign out"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent transition-all duration-200 hover:border-[rgba(255,77,77,0.25)] hover:bg-[rgba(255,77,77,0.08)] md:h-12 md:w-12"
          style={{ color: 'rgba(255,77,77,0.75)' }}
        >
          <LogOut className="h-[18px] w-[18px] md:h-5 md:w-5" strokeWidth={1.75} />
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/12 bg-[rgba(4,12,28,0.92)] px-2.5 py-1 font-sans text-[11px] text-[#ff6b6b] opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 md:block">
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
