import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      className="flex items-start justify-between gap-4 mb-10 pb-8 border-b"
      style={{ marginBottom: 40, paddingBottom: 32, borderBottomColor: 'var(--line)' }}
    >
      <div>
        <h1
          className="font-display text-[40px] font-light"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h1>
        {subtitle != null && (
          <p className="font-sans text-[14px] mt-1.5" style={{ color: 'var(--text-3)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions != null && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
