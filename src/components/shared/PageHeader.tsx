import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header
      className="flex items-start justify-between gap-4 border-b w-full"
      style={{
        paddingBottom: 24,
        marginBottom: 32,
        borderBottomColor: 'var(--line)',
        background: 'var(--bg)',
      }}
    >
      <div>
        <h1
          className="font-display text-[28px] sm:text-[32px] font-semibold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h1>
        {subtitle != null && (
          <p className="font-sans text-[14px] mt-1" style={{ color: 'var(--text-3)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions != null && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
