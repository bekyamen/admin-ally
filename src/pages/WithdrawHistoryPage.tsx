import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getWithdrawHistoryAPI, type Withdrawal } from '@/lib/api';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function WithdrawHistoryPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getWithdrawHistoryAPI();
      setWithdrawals(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered = statusFilter === 'ALL' ? withdrawals : withdrawals.filter((w) => w.status === statusFilter);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-success/10 text-success';
      case 'REJECTED': return 'bg-destructive/10 text-destructive';
      default: return 'bg-warning/10 text-warning';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Withdraw History</h1>
          <p className="text-sm text-muted-foreground">All approved and rejected withdrawals</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={fetchHistory} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          No withdraw history found
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Network</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">USD Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((w) => (
                  <tr key={w.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{w.user.firstName} {w.user.lastName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{w.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{w.coin}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{w.network}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{w.amount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{w.fee}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">${w.usdValue.toLocaleString()}</td>
                    <td className="px-4 py-3 max-w-[160px] truncate font-mono text-xs text-muted-foreground" title={w.address}>{w.address}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(w.status)}`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-xs text-muted-foreground" title={w.reviewNote || ''}>
                      {w.reviewNote || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
