import type { ReactNode } from 'react';

interface DataTableHeaderProps {
  title?: string;
  actions?: ReactNode;
}

interface DataTableProps {
  header?: DataTableHeaderProps;
  children: ReactNode;
  empty?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function DataTable({
  header,
  children,
  empty = false,
  emptyIcon,
  emptyTitle = 'No data',
  emptySubtitle,
}: DataTableProps) {
  return (
    <div className="panel overflow-hidden">
      {header != null && (header.title != null || header.actions != null) && (
        <div
          className="flex items-center justify-between py-5 px-6 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          {header.title != null && (
            <h2 className="font-display text-[22px] font-normal" style={{ color: 'var(--text)' }}>
              {header.title}
            </h2>
          )}
          {header.actions != null && <div>{header.actions}</div>}
        </div>
      )}
      {empty ? (
        <div className="py-16 px-6 text-center">
          {emptyIcon != null && (
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center" style={{ color: 'var(--text-4)' }}>
              {emptyIcon}
            </div>
          )}
          <p className="font-display text-[28px] font-light" style={{ color: 'var(--text-3)' }}>
            {emptyTitle}
          </p>
          {emptySubtitle != null && (
            <p className="font-sans text-[13px] mt-2" style={{ color: 'var(--text-4)' }}>
              {emptySubtitle}
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          {children}
        </div>
      )}
    </div>
  );
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  children?: ReactNode;
}

export function BulkActionBar({ selectedCount, onClear, children }: BulkActionBarProps) {
  return (
    <div
      className="sticky bottom-0 flex items-center gap-4 py-3 px-6 border-t"
      style={{ background: 'var(--surface)', borderColor: 'var(--line-gold)' }}
    >
      <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--gold)' }}>
        {selectedCount} selected
      </span>
      {children}
      <button type="button" onClick={onClear} className="btn btn-ghost btn-sm ml-auto">
        Clear
      </button>
    </div>
  );
}
