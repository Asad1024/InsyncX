'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  BarChart2,
  Wallet,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface VendorSidebarProps {
  storeName?: string;
  storeSlug?: string;
}

const overviewNav = [{ href: '/vendor', label: 'Dashboard', icon: LayoutDashboard }];
const storeNav = [
  { href: '/vendor/products', label: 'Products', icon: Package },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/vendor/store', label: 'Store Settings', icon: Store },
];
const insightsNav = [
  { href: '/vendor/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/vendor/payouts', label: 'Payouts', icon: Wallet },
  { href: '/vendor/coupons', label: 'Coupons', icon: Tag },
];
const systemNav = [{ href: '/vendor/settings', label: 'Settings', icon: Settings }];

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  pathname: string;
}) {
  const isActive = href === '/vendor' ? pathname === '/vendor' : pathname.startsWith(href);
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
    </Link>
  );
}

export function VendorSidebar({ storeName, storeSlug }: VendorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 h-screen w-[240px] shrink-0 flex flex-col overflow-y-auto"
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
      }}
    >
      <div className="py-5 px-4 pb-4 border-b flex items-center justify-center gap-2.5" style={{ borderColor: 'var(--line)' }}>
        <Link href="/vendor" className="flex items-center justify-center no-underline shrink-0">
          <Image src="/InsyncX%20logo.avif" alt="" width={52} height={52} className="shrink-0 object-contain" />
        </Link>
        <span
          className="font-sans text-[9px] font-bold uppercase py-0.5 px-2 rounded-full border"
          style={{
            background: 'var(--gold-bg)',
            borderColor: 'var(--line-gold)',
            color: 'var(--gold)',
          }}
        >
          Vendor
        </span>
      </div>
      {storeName != null && (
        <p
          className="font-sans text-[11px] mt-0.5 px-4 truncate max-w-[200px]"
          style={{ color: 'var(--text-3)' }}
        >
          {storeName}
        </p>
      )}
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
          Store
        </p>
        {storeNav.map((item) => (
          <NavLink key={item.href} pathname={pathname} {...item} />
        ))}
        <p
          className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] pt-4 pb-1.5 px-2"
          style={{ color: 'var(--text-4)' }}
        >
          Insights
        </p>
        {insightsNav.map((item) => (
          <NavLink key={item.href} pathname={pathname} {...item} />
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
        {storeSlug != null && (
          <Link
            href={`/store/${storeSlug}`}
            className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-[9px] font-sans text-[12px] no-underline transition-colors duration-150"
            style={{ color: 'var(--text-3)' }}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            View My Store
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-[9px] font-sans text-[13px] font-medium w-full text-left border-0 bg-transparent cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--red)' }}
        >
          <LogOut className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
