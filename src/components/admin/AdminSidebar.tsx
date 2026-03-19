'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Store,
  ShoppingBag,
  Tag,
  Wallet,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const overviewNav = [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }];
const catalogNav = [
  { href: '/admin/products', label: 'All Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/official-store', label: 'Official Store', icon: Store },
];
const commerceNav = [
  { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
];
const communityNav = [
  { href: '/admin/vendors', label: 'Vendors', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
];
const systemNav = [{ href: '/admin/settings', label: 'Settings', icon: Settings }];

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  showDot,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  pathname: string;
  showDot?: boolean;
}) {
  const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-[9px] font-sans text-[13px] font-medium no-underline transition-all duration-150 mb-0.5 relative"
      style={{
        color: isActive ? 'var(--gold)' : 'var(--text-3)',
        background: isActive ? 'var(--gold-bg)' : 'transparent',
      }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? 'var(--gold)' : 'inherit' }} />
      {label}
      {showDot === true && (
        <span
          className="absolute right-2.5 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--red)' }}
        />
      )}
    </Link>
  );
}

export function AdminSidebar({ pendingVendorsCount = 0 }: { pendingVendorsCount?: number }) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 h-screen w-[240px] shrink-0 flex flex-col overflow-y-auto"
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
      }}
    >
      <div className="py-5 px-4 pb-4 border-b flex items-center gap-2.5" style={{ borderColor: 'var(--line)' }}>
        <Link href="/admin" className="font-display text-[20px] font-normal" style={{ color: 'var(--text)' }}>
          InsyncX
        </Link>
        <span
          className="font-sans text-[9px] font-bold uppercase py-0.5 px-2 rounded-full border"
          style={{
            background: 'rgba(59,130,246,0.1)',
            borderColor: 'rgba(59,130,246,0.2)',
            color: 'var(--blue)',
          }}
        >
          Admin
        </span>
      </div>
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] pt-2 pb-1.5 px-2"
          style={{ color: 'var(--text-4)' }}
        >
          Overview
        </p>
        {overviewNav.map((item) => (
          <NavLink key={item.href} pathname={pathname} {...item} />
        ))}
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] pt-4 pb-1.5 px-2"
          style={{ color: 'var(--text-4)' }}
        >
          Catalog
        </p>
        {catalogNav.map((item) => (
          <NavLink key={item.href} pathname={pathname} {...item} />
        ))}
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] pt-4 pb-1.5 px-2"
          style={{ color: 'var(--text-4)' }}
        >
          Commerce
        </p>
        {commerceNav.map((item) => (
          <NavLink key={item.href} pathname={pathname} {...item} />
        ))}
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] pt-4 pb-1.5 px-2"
          style={{ color: 'var(--text-4)' }}
        >
          Community
        </p>
        {communityNav.map((item) => (
          <NavLink
            key={item.href}
            pathname={pathname}
            {...item}
            showDot={item.href === '/admin/vendors' && pendingVendorsCount > 0}
          />
        ))}
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] pt-4 pb-1.5 px-2"
          style={{ color: 'var(--text-4)' }}
        >
          System
        </p>
        {systemNav.map((item) => (
          <NavLink key={item.href} pathname={pathname} {...item} />
        ))}
      </nav>
      <div
        className="py-3 px-2 pb-4 border-t flex flex-col gap-1"
        style={{ borderColor: 'var(--line)' }}
      >
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-[9px] font-sans text-[13px] font-medium w-full text-left border-0 bg-transparent cursor-pointer transition-colors duration-150 hover:bg-[var(--red-bg)]"
          style={{ color: 'var(--red)' }}
        >
          <LogOut className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
