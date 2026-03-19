'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  count: number;
}

interface AnalyticsOrdersChartProps {
  data: DataPoint[];
  height?: number;
}

export function AnalyticsOrdersChart({ data, height = 280 }: AnalyticsOrdersChartProps) {
  return (
    <div className="flex flex-col">
      <h2 className="font-display text-[20px] font-normal mb-6" style={{ color: 'var(--text)' }}>
        Orders over time
      </h2>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="var(--blue)" stopOpacity={0.2} />
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
              formatter={(value: number) => [value, 'Orders']}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="count" fill="url(#ordersBarGradient)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
