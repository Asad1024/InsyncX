import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader title="Users" subtitle={`${users.length} registered users`} />
      <DataTable empty={users.length === 0} emptyTitle="No users">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>User</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Email</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Role</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Status</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-sans text-[12px] font-semibold"
                      style={{ background: 'var(--surface3)', color: 'var(--text-3)' }}
                    >
                      {(u.name ?? 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text)' }}>{u.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{u.email}</td>
                <td className="py-3.5 px-4">
                  <span className={`badge ${u.role === 'VENDOR' ? 'badge-gold-outline' : 'badge-neutral'}`} style={u.role === 'ADMIN' ? { background: 'var(--blue-bg)', color: 'var(--blue)' } : undefined}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={u.isBanned ? 'badge badge-red' : 'badge badge-green'}>{u.isBanned ? 'Banned' : 'Active'}</span>
                </td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
