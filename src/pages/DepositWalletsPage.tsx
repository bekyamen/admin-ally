import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { createDepositWalletAPI } from '@/lib/api';
import { Plus, X, Loader2, Wallet, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CreatedWallet {
  id: string;
  coin: string;
  address: string;
  qrImage: string;
  isActive: boolean;
  createdAt: string;
}

export default function DepositWalletsPage() {
  const [wallets, setWallets] = useState<CreatedWallet[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ coin: 'BTC', address: '' });
  const [qrFile, setQrFile] = useState<File | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coin || !form.address || !qrFile) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await createDepositWalletAPI(form.coin, form.address, qrFile);
      setWallets((prev) => [res.data, ...prev]);
      toast.success(`${form.coin} wallet created`);
      setShowModal(false);
      setForm({ coin: 'BTC', address: '' });
      setQrFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposit Wallets</h1>
          <p className="text-sm text-muted-foreground">Manage deposit wallet addresses and QR codes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Wallet
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No wallets created yet. Add your first deposit wallet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w) => (
            <div key={w.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-semibold text-foreground">{w.coin}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${w.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {w.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-center bg-muted/30 p-6">
                <img src={`http://localhost:5000/${w.qrImage}`} alt={`${w.coin} QR`} className="h-40 w-40 rounded-lg" />
              </div>
              <div className="p-4">
                <p className="truncate font-mono text-xs text-muted-foreground" title={w.address}>{w.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Create Deposit Wallet</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Coin</label>
                <select
                  value={form.coin}
                  onChange={(e) => setForm({ ...form, coin: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>BTC</option>
                  <option>ETH</option>
                  <option>USDT</option>
                  <option>BNB</option>
                  <option>SOL</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Wallet Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0x..."
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">QR Code Image</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                  <Upload className="h-4 w-4" />
                  {qrFile ? qrFile.name : 'Click to upload QR image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Creating...' : 'Create Wallet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
