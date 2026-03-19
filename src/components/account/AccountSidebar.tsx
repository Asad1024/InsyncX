'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  User,
  Store,
  ArrowUpRight,
  LogOut,
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

export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const initials = (user.name ?? 'U').slice(0, 2).toUpperCase();

  return (
    <aside
      className="sticky top-16 h-[calc(100vh-64px)] flex flex-col border-r overflow-y-auto md:flex"
      style={{
        borderRightColor: 'var(--line)',
        padding: '32px 20px',
        top: 64,
        height: 'calc(100vh - 64px)',
      }}
    >
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-3.5 flex items-center justify-center overflow-hidden border-2"
          style={{
            background: 'var(--gold-bg)',
            borderColor: 'var(--line-gold)',
          }}
        >
          {user.image ? (
            <img
              src={user.image}
              alt=""
              width={64}
              height={64}
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="font-display text-[26px] font-normal" style={{ color: 'var(--gold)' }}>
              {initials}
            </span>
          )}
        </div>
        <p className="font-sans text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
          {user.name ?? 'Customer'}
        </p>
        <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
          {user.email ?? ''}
        </p>
        {(user.role === 'VENDOR' || user.role === 'ADMIN') && (
          <span className="inline-block mt-2 badge badge-gold-outline">
            {user.role === 'ADMIN' ? 'Admin' : 'Vendor'}
          </span>
        )}
        <p className="font-sans text-[11px] mt-1.5" style={{ color: 'var(--text-4)' }}>
          Member since 2025
        </p>
      </div>

      <div className="flex-1 border-t flex flex-col" style={{ borderColor: 'var(--line)', margin: '0 0 20px' }}>
        <div className="pt-4" style={{ paddingTop: 20 }} />
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em]"
          style={{ color: 'var(--text-4)', padding: '16px 8px 6px' }}
        >
          Account
        </p>
        <nav className="flex flex-col gap-0.5">
          {accountNav.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/account' ? pathname === '/account' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-[10px] font-sans text-[13px] font-medium no-underline transition-all duration-150 ${!isActive ? 'hover:bg-[var(--surface2)] hover:text-[var(--text)]' : ''}`}
                style={{
                  color: isActive ? 'var(--gold)' : 'var(--text-3)',
                  background: isActive ? 'var(--gold-bg)' : 'transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? 'var(--gold)' : 'inherit' }}
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] mt-4"
          style={{ color: 'var(--text-4)', padding: '16px 8px 6px' }}
        >
          Settings
        </p>
        <nav className="flex flex-col gap-0.5 flex-1">
          {settingsNav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-[10px] font-sans text-[13px] font-medium no-underline transition-all duration-150 ${!isActive ? 'hover:bg-[var(--surface2)] hover:text-[var(--text)]' : ''}`}
                style={{
                  color: isActive ? 'var(--gold)' : 'var(--text-3)',
                  background: isActive ? 'var(--gold-bg)' : 'transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? 'var(--gold)' : 'inherit' }}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="mt-auto pt-5 border-t flex flex-col gap-0"
        style={{ borderTopColor: 'var(--line)' }}
      >
        {user.role === 'VENDOR' && (
          <Link
            href="/vendor"
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-[10px] font-sans text-[13px] font-medium no-underline transition-all duration-150 mb-2 hover:bg-[var(--surface2)] hover:text-[var(--text)]"
            style={{ color: 'var(--text-3)' }}
          >
            <Store className="w-4 h-4 shrink-0" />
            Vendor Portal
            <ArrowUpRight className="w-3 h-3 ml-auto" style={{ color: 'var(--text-4)' }} />
          </Link>
        )}
        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-[10px] font-sans text-[13px] font-medium no-underline transition-all duration-150 mb-2 hover:bg-[var(--surface2)] hover:text-[var(--text)]"
            style={{ color: 'var(--text-3)' }}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Admin Panel
            <ArrowUpRight className="w-3 h-3 ml-auto" style={{ color: 'var(--text-4)' }} />
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2.5 py-2.5 px-3 rounded-[10px] font-sans text-[13px] font-medium w-full text-left border-0 bg-transparent cursor-pointer transition-colors duration-150 hover:bg-[var(--red-bg)]"
          style={{ color: 'var(--red)' }}
        >
          <LogOut className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
