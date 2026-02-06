import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useDashboardStore } from '@/store/dashboardStore';
import { QrCode, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function QRCodesPage() {
  const { qrCodes, updateQRCode } = useDashboardStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const startEdit = (id: string, currentUrl: string) => {
    setEditingId(id);
    setUrlInput(currentUrl);
  };

  const saveEdit = (id: string) => {
    if (urlInput.trim()) {
      updateQRCode(id, urlInput.trim());
      toast.success('QR code updated');
    }
    setEditingId(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">QR Code Management</h1>
        <p className="text-sm text-muted-foreground">Update withdrawal QR codes for each asset type</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map((qr) => (
          <div
            key={qr.id}
            className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{qr.label}</span>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {qr.assetType}
              </span>
            </div>
            <div className="flex items-center justify-center bg-muted/30 p-6">
              <img src={qr.imageUrl} alt={qr.label} className="h-40 w-40 rounded-lg" />
            </div>
            <div className="p-4">
              {editingId === qr.id ? (
                <div className="flex gap-2">
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter QR image URL"
                  />
                  <button
                    onClick={() => saveEdit(qr.id)}
                    className="rounded-lg bg-success/10 p-1.5 text-success hover:bg-success/20"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(qr.id, qr.imageUrl)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  <Pencil className="h-3 w-3" /> Edit QR Code
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
