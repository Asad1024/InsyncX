'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataPoint {
  title: string;
  revenue: number;
}

interface AnalyticsTopProductsChartProps {
  data: DataPoint[];
  height?: number;
}

const COLORS = ['var(--gold)', '#c4b5fd', 'var(--green)', 'var(--blue)', 'var(--amber)', '#f472b6', '#2dd4bf', '#94a3b8'];

export function AnalyticsTopProductsChart({ data, height = 280 }: AnalyticsTopProductsChartProps) {
  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    name: d.title.length > 20 ? d.title.slice(0, 20) + '…' : d.title,
  }));

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-[20px] font-normal mb-6" style={{ color: 'var(--text)' }}>
        Top products by revenue
      </h2>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `$${v}`}
              tick={{ fontFamily: 'var(--font-sans)', fontSize: 11, fill: 'var(--text-4)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontFamily: 'var(--font-sans)', fontSize: 11, fill: 'var(--text-2)' }}
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
              labelFormatter={(_, payload) => payload?.[0]?.payload?.title ?? ''}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} minPointSize={8}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
