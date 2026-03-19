import { Check, X } from 'lucide-react';
import type { OrderStatus } from '@prisma/client';

const STEPS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'] as const;
const statusToStep: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
}

export function OrderStatusStepper({ currentStatus }: OrderStatusStepperProps) {
  const stepIndex = statusToStep[currentStatus] ?? 0;
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="card card-p">
        <div className="flex items-center justify-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border-2"
            style={{ background: 'var(--red-bg)', borderColor: 'var(--red)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--red)' }} />
          </div>
          <span className="font-sans text-[12px] font-medium uppercase tracking-[0.06em]" style={{ color: 'var(--text)' }}>
            Order cancelled
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {STEPS.map((label, i) => {
        const completed = i <= stepIndex;
        const current = i === stepIndex;
        return (
          <div
            key={label}
            className="rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 min-h-[100px] w-full"
            style={{
              background: completed ? 'var(--gold-bg)' : 'var(--surface2)',
              borderColor: current ? 'var(--gold)' : completed ? 'var(--line-gold)' : 'var(--line)',
            }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center border-2 flex-shrink-0"
              style={{
                background: completed ? 'var(--gold)' : 'var(--surface3)',
                borderColor: current && !completed ? 'var(--gold)' : completed ? 'var(--gold)' : 'var(--line)',
              }}
            >
              {completed ? (
                <Check className="w-6 h-6 text-[#000]" strokeWidth={2.5} />
              ) : (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: current ? 'var(--gold)' : 'var(--text-4)' }}
                />
              )}
            </div>
            <span
              className="font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-center"
              style={{ color: completed || current ? 'var(--text)' : 'var(--text-4)' }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
