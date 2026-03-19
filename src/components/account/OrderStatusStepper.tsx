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
    <div className="card card-p">
      <div className="flex items-start justify-between relative">
        <div
          className="absolute top-5 left-0 right-0 h-0.5 z-0"
          style={{ background: 'var(--surface3)' }}
        />
        <div
          className="absolute top-5 left-0 h-0.5 z-[1] transition-[width] duration-300 ease-out"
          style={{
            background: 'var(--gold)',
            width: stepIndex >= 0 ? `${(stepIndex / (STEPS.length - 1)) * 100}%` : '0%',
          }}
        />
        {STEPS.map((label, i) => {
          const completed = i <= stepIndex;
          const current = i === stepIndex;
          return (
            <div
              key={label}
              className="flex flex-col items-center gap-2.5 relative z-[2]"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                style={{
                  background: completed ? 'var(--gold)' : 'var(--surface2)',
                  borderColor: current && !completed ? 'var(--gold)' : completed ? 'var(--gold)' : 'var(--line)',
                }}
              >
                {completed ? (
                  <Check className="w-[18px] h-[18px] text-[#000]" strokeWidth={2.5} />
                ) : (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: current ? 'var(--gold)' : 'var(--text-4)' }}
                  />
                )}
              </div>
              <span
                className="font-sans text-[12px] font-medium uppercase tracking-[0.06em]"
                style={{ color: completed || current ? 'var(--text)' : 'var(--text-4)' }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
