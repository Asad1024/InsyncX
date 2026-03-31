'use client';

import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 mb-6">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="font-sans text-[12px] text-[var(--text-4)] mx-0.5">/</span>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-sans text-[12px] text-[var(--text-3)] hover:text-[var(--text)] transition-colors duration-150"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-sans text-[12px] text-[var(--text-3)] cursor-default">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
