import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getDepositHistoryAPI, type Deposit } from '@/lib/api';
import { Loader2, RefreshCw, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function DepositHistoryPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [proofModal, setProofModal] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getDepositHistoryAPI();
      setDeposits(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered = statusFilter === 'ALL' ? deposits : deposits.filter((d) => d.status === statusFilter);

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = API_BASE.replace('/api', '');
    return `${base}/${path}`;
  };

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
          <h1 className="text-2xl font-bold text-foreground">Deposit History</h1>
          <p className="text-sm text-muted-foreground">All approved and rejected deposits</p>
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
          No deposit history found
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tx Hash</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{d.user.firstName} {d.user.lastName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{d.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{d.coin}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">${d.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 max-w-[160px] truncate font-mono text-xs text-muted-foreground" title={d.transactionHash}>{d.transactionHash}</td>
                    <td className="px-4 py-3">
                      {d.proofImage ? (
                        <button onClick={() => setProofModal(d.proofImage!)} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80">
                          <Eye className="h-3 w-3" /> View
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(d.status)}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-xs text-muted-foreground" title={d.reviewNote || ''}>
                      {d.reviewNote || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof Image Modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setProofModal(null)}>
          <div className="max-h-[80vh] max-w-lg overflow-hidden rounded-xl border border-border bg-card p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={getImageUrl(proofModal)} alt="Proof" className="max-h-[75vh] w-full rounded-lg object-contain" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
