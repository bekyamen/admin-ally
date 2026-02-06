import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useDashboardStore, type AssetType, type WithdrawalStatus } from '@/store/dashboardStore';
import { Check, X, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function WithdrawalsPage() {
  const { withdrawals, updateWithdrawalStatus } = useDashboardStore();
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | 'All'>('All');
  const [assetFilter, setAssetFilter] = useState<AssetType | 'All'>('All');

  const filtered = withdrawals.filter((w) => {
    if (statusFilter !== 'All' && w.status !== statusFilter) return false;
    if (assetFilter !== 'All' && w.assetType !== assetFilter) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    updateWithdrawalStatus(id, 'Approved');
    toast.success('Withdrawal approved');
  };

  const handleReject = (id: string) => {
    updateWithdrawalStatus(id, 'Rejected');
    toast.error('Withdrawal rejected');
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Withdrawals</h1>
          <p className="text-sm text-muted-foreground">Manage trader withdrawal requests</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WithdrawalStatus | 'All')}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value as AssetType | 'All')}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="All">All Assets</option>
          <option value="Crypto">Crypto</option>
          <option value="Forex">Forex</option>
          <option value="Gold">Gold</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trader ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((w) => (
                <tr key={w.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{w.traderId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{w.userId}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">${w.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.date}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {w.assetType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {w.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(w.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(w.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No withdrawals match filters</p>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const styles = {
    Pending: 'bg-warning/10 text-warning',
    Approved: 'bg-success/10 text-success',
    Rejected: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
