'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const RANGES = ['7D', '30D', '90D', '1Y'] as const;

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface RevenueChartProps {
  title?: string;
  data: DataPoint[];
  height?: number;
}

export function RevenueChart({ title = 'Revenue', data, height = 240 }: RevenueChartProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]>('30D');

  return (
    <div className="card flex flex-col" style={{ padding: 24 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-[22px] font-normal" style={{ color: 'var(--text)' }}>
          {title}
        </h2>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className="font-sans text-[11px] font-medium py-1.5 px-3 rounded-full border cursor-pointer transition-all duration-150"
              style={{
                borderColor: r === range ? 'var(--line-gold)' : 'var(--line)',
                background: r === range ? 'var(--gold-bg)' : 'transparent',
                color: r === range ? 'var(--gold)' : 'var(--text-3)',
              }}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontFamily: 'var(--font-sans)', fontSize: 11, fill: 'var(--text-4)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={{ fontFamily: 'var(--font-sans)', fontSize: 11, fill: 'var(--text-4)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface2)',
                border: '1px solid var(--line-md)',
                borderRadius: 10,
                padding: '10px 14px',
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: 'var(--text)',
              }}
              formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
              labelFormatter={(label) => label}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--gold)"
              strokeWidth={2}
              fill="url(#goldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
