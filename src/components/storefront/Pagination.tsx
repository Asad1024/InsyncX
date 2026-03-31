'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryWithoutPage?: Record<string, string>;
}

function buildPageUrl(basePath: string, queryWithoutPage: Record<string, string>, page: number): string {
  const q = new URLSearchParams(queryWithoutPage);
  q.set('page', String(page));
  const s = q.toString();
  return s ? `${basePath}?${s}` : `${basePath}?page=${page}`;
}

export function Pagination({ currentPage, totalPages, basePath, queryWithoutPage = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getHref = (p: number) => buildPageUrl(basePath, queryWithoutPage, p);

  const showPages = (() => {
    const pages: (number | 'ellipsis')[] = [];
    const show = 5;
    let start = Math.max(1, currentPage - Math.floor(show / 2));
    let end = Math.min(totalPages, start + show - 1);
    if (end - start + 1 < show) start = Math.max(1, end - show + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (start > 1) {
      pages.unshift(1);
      if (start > 2) pages.splice(1, 0, 'ellipsis');
    }
    if (end < totalPages) {
      pages.push(totalPages);
      if (end < totalPages - 1) pages.splice(pages.length - 1, 0, 'ellipsis');
    }
    return pages;
  })();

  return (
    <div className="flex items-center justify-center gap-1 my-12">
      {currentPage > 1 ? (
        <Link
          href={getHref(currentPage - 1)}
          className="h-10 w-10 rounded-[10px] flex items-center justify-center font-sans text-[var(--text-3)] border transition-all duration-150 hover:bg-[var(--surface3)] hover:border-[var(--line-md)] hover:text-[var(--text)]"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--line)',
          }}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
      ) : (
        <span
          className="h-10 w-10 rounded-[10px] flex items-center justify-center font-sans text-[var(--text-4)] border opacity-30 cursor-not-allowed"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--line)',
          }}
          aria-hidden
        >
          <ChevronLeft className="w-5 h-5" />
        </span>
      )}

      <div className="flex items-center gap-1 mx-1">
        {showPages.map((p, i) =>
          p === 'ellipsis' ? (
            <span
              key={`e-${i}`}
              className="w-9 h-9 flex items-center justify-center font-sans text-[13px] text-[var(--text-4)]"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={getHref(p)}
              className={`min-w-[36px] h-9 rounded-[10px] flex items-center justify-center font-sans text-[13px] transition-all duration-150 ${
                p === currentPage
                  ? 'bg-[var(--gold)] text-white border-[var(--gold)] font-bold'
                  : 'bg-[var(--surface2)] text-[var(--text-3)] border border-[var(--line)] hover:bg-[var(--surface3)] hover:border-[var(--line-md)] hover:text-[var(--text)]'
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={getHref(currentPage + 1)}
          className="h-10 w-10 rounded-[10px] flex items-center justify-center font-sans text-[var(--text-3)] border transition-all duration-150 hover:bg-[var(--surface3)] hover:border-[var(--line-md)] hover:text-[var(--text)]"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--line)',
          }}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      ) : (
        <span
          className="h-10 w-10 rounded-[10px] flex items-center justify-center font-sans text-[var(--text-4)] border opacity-30 cursor-not-allowed"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--line)',
          }}
          aria-hidden
        >
          <ChevronRight className="w-5 h-5" />
        </span>
      )}
    </div>
  );
}
