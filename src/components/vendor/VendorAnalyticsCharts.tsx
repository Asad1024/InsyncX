'use client';

import { RevenueChart } from '@/components/shared/RevenueChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

export function VendorAnalyticsCharts({
  chartData,
  pieData,
}: {
  chartData: ChartDataPoint[];
  pieData: PieDataPoint[];
}) {
  return (
    <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: '60% 1fr' }}>
      <div>
        <RevenueChart title="Revenue" data={chartData} height={240} />
      </div>
      <div className="card card-p">
        <h2 className="font-display text-[22px] font-normal mb-6" style={{ color: 'var(--text)' }}>Order Status</h2>
        {pieData.length > 0 ? (
          <>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--line-md)',
                      borderRadius: 10,
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="font-sans text-[12px]" style={{ color: 'var(--text-3)' }}>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>No orders yet</p>
        )}
      </div>
    </div>
  );
}
