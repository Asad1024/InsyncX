import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('shimmer bg-[#1a1a1a]', className)}
      {...props}
    />
  );
}
