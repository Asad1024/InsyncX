'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface AnalyticsOrderStatusChartProps {
  data: DataPoint[];
  height?: number;
}

const COLORS = ['var(--blue)', 'var(--green)', 'var(--gold)', 'var(--amber)'];

export function AnalyticsOrderStatusChart({ data, height = 280 }: AnalyticsOrderStatusChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col">
        <h2 className="font-display text-[20px] font-normal mb-6" style={{ color: 'var(--text)' }}>
          Orders by status
        </h2>
        <div
          className="flex items-center justify-center rounded-xl border"
          style={{ height, borderColor: 'var(--line)', background: 'var(--surface2)' }}
        >
          <p className="font-sans text-[13px]" style={{ color: 'var(--text-4)' }}>No orders in period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-[20px] font-normal mb-6" style={{ color: 'var(--text)' }}>
        Orders by status
      </h2>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </Pie>
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
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => <span style={{ color: 'var(--text-2)' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
