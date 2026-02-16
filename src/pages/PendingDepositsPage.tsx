import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getPendingDepositsAPI, approveDepositAPI, rejectDepositAPI } from '@/lib/api';
import { Check, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Deposit {
  id: string;
  userId: string;
  walletId: string;
  coin: string;
  amount: number;
  transactionHash: string;
  status: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    balance: number;
    role: string;
  };
}

export default function PendingDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

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
      await rejectDepositAPI(id);
      toast.success('Deposit rejected');
      setDeposits((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Deposits</h1>
          <p className="text-sm text-muted-foreground">Approve or reject user deposit requests</p>
        </div>
        <button
          onClick={fetchDeposits}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
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
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {d.coin}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">${d.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[200px] truncate" title={d.transactionHash}>
                      {d.transactionHash}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">${d.user.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(d.id)}
                          disabled={actionId === d.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(d.id)}
                          disabled={actionId === d.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                        >
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
    </DashboardLayout>
  );
}
