'use client';

import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return <div className="insync-page-enter min-h-0 min-w-0">{children}</div>;
}
