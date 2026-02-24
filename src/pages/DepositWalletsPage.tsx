import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  createDepositWalletAPI, editDepositWalletAPI, deleteDepositWalletAPI,
  type DepositWallet,
} from '@/lib/api';
import { Plus, X, Loader2, Wallet, Upload, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const NETWORK_OPTIONS: Record<string, string[]> = {
  BTC: ['Bitcoin'],
  ETH: ['ERC20'],
  USDT: ['TRC20', 'ERC20', 'BEP20'],
};

export default function DepositWalletsPage() {
  const [groupedWallets, setGroupedWallets] = useState<Record<string, DepositWallet[]>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWallet, setEditWallet] = useState<DepositWallet | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ coin: 'BTC', network: 'Bitcoin', address: '' });
  const [qrFile, setQrFile] = useState<File | null>(null);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/deposit/wallets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGroupedWallets(data.data);
      }
    } catch {
      // Wallet list endpoint might not exist yet; keep empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallets(); }, []);

  const openCreate = () => {
    setEditWallet(null);
    setForm({ coin: 'BTC', network: 'Bitcoin', address: '' });
    setQrFile(null);
    setShowModal(true);
  };

  const openEdit = (w: DepositWallet) => {
    setEditWallet(w);
    setForm({ coin: w.coin, network: w.network, address: w.address });
    setQrFile(null);
    setShowModal(true);
  };

  const handleCoinChange = (coin: string) => {
    const networks = NETWORK_OPTIONS[coin] || ['Default'];
    setForm({ ...form, coin, network: networks[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editWallet) {
        await editDepositWalletAPI(editWallet.coin, editWallet.network, form.address || undefined, qrFile || undefined);
        toast.success(`${editWallet.coin} (${editWallet.network}) wallet updated`);
      } else {
        if (!qrFile) { toast.error('QR image is required'); setActionLoading(false); return; }
        await createDepositWalletAPI(form.coin, form.network, form.address, qrFile);
        toast.success(`${form.coin} (${form.network}) wallet created`);
      }
      setShowModal(false);
      fetchWallets();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (w: DepositWallet) => {
    if (!confirm(`Delete ${w.coin} (${w.network}) wallet?`)) return;
    try {
      await deleteDepositWalletAPI(w.coin, w.network);
      toast.success(`${w.coin} (${w.network}) wallet deleted`);
      fetchWallets();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const getQrUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const base = API_BASE.replace('/api', '');
    return `${base}/${path}`;
  };

  const allWallets = Object.values(groupedWallets).flat();
  const coinGroups = Object.keys(groupedWallets);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposit Wallets</h1>
          <p className="text-sm text-muted-foreground">Manage deposit wallet addresses and QR codes</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchWallets} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Wallet
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : allWallets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No wallets yet. Add your first deposit wallet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {coinGroups.map((coin) => (
            <div key={coin}>
              <h2 className="mb-3 text-lg font-semibold text-foreground">{coin}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedWallets[coin].map((w) => (
                  <div key={w.id} className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{w.coin}</span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{w.network}</span>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${w.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {w.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center bg-muted/30 p-6">
                      <img src={getQrUrl(w.qrImage)} alt={`${w.coin} QR`} className="h-40 w-40 rounded-lg object-contain" />
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="truncate font-mono text-xs text-muted-foreground" title={w.address}>{w.address}</p>
                      <p className="text-xs text-muted-foreground">Created: {new Date(w.createdAt).toLocaleDateString()}</p>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(w)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(w)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{editWallet ? `Edit ${editWallet.coin} (${editWallet.network}) Wallet` : 'Create Deposit Wallet'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editWallet && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Coin</label>
                    <select value={form.coin} onChange={(e) => handleCoinChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>BTC</option><option>ETH</option><option>USDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Network</label>
                    <select value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      {(NETWORK_OPTIONS[form.coin] || ['Default']).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Wallet Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0x..." required={!editWallet} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">QR Code Image {editWallet ? '(optional)' : ''}</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                  <Upload className="h-4 w-4" />
                  {qrFile ? qrFile.name : 'Click to upload QR image'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setQrFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <button type="submit" disabled={actionLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editWallet ? 'Update Wallet' : 'Create Wallet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
