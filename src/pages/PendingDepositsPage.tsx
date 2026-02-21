import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getPendingDepositsAPI, approveDepositAPI, rejectDepositAPI, type Deposit } from '@/lib/api';
import { Check, X, Loader2, RefreshCw, Eye, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function PendingDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [proofModal, setProofModal] = useState<string | null>(null);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await getPendingDepositsAPI();
      setDeposits(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await approveDepositAPI(id);
      toast.success('Deposit approved');
      setDeposits((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await rejectDepositAPI(id, reviewNote || undefined);
      toast.success('Deposit rejected');
      setDeposits((prev) => prev.filter((d) => d.id !== id));
      setRejectModal(null);
      setReviewNote('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActionId(null);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = API_BASE.replace('/api', '');
    return `${base}/${path}`;
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Deposits</h1>
          <p className="text-sm text-muted-foreground">Approve or reject user deposit requests</p>
        </div>
        <button onClick={fetchDeposits} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : deposits.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          No pending deposits
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Balance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deposits.map((d) => (
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
                    <td className="px-4 py-3 text-muted-foreground">${d.user.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(d.id)} disabled={actionId === d.id} className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-50">
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button onClick={() => setRejectModal(d.id)} disabled={actionId === d.id} className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50">
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Reject Deposit</h2>
              <button onClick={() => { setRejectModal(null); setReviewNote(''); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Review Note (optional)</label>
                <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Reason for rejection..." />
              </div>
              <button onClick={() => handleReject(rejectModal)} disabled={actionId === rejectModal} className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
                {actionId === rejectModal ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Confirm Reject
              </button>
            </div>
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
