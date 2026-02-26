import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader2, RefreshCw, Eye, X, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface VerificationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Verification {
  id: string;
  userId: string;
  documentType: string;
  fullName: string;
  documentNumber: string;
  frontSideUrl: string;
  backSideUrl: string;
  status: string;
  reviewNote?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
  user: VerificationUser;
}

interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
}

type StatusFilter = '' | 'APPROVED' | 'REJECTED';

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export default function VerificationHistoryPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, pages: 1 });
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<Verification | null>(null);

  const fetchHistory = async (page = 1, status: StatusFilter = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (status) params.set('status', status);
      const data = await fetchWithAuth(`${API_BASE}/identity-verification/history?${params.toString()}`);
      setVerifications(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch verification history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1, statusFilter); }, [statusFilter]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      APPROVED: 'bg-emerald-500/10 text-emerald-600',
      REJECTED: 'bg-destructive/10 text-destructive',
    };
    return map[status] || 'bg-secondary text-secondary-foreground';
  };

  const filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verification History</h1>
          <p className="text-sm text-muted-foreground">All reviewed KYC verifications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchHistory(pagination.page)}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <FileCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No verification records found</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Document</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Full Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Review Note</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{v.user.firstName} {v.user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{v.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{v.documentType}</p>
                      <p className="text-xs text-muted-foreground font-mono">{v.documentNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{v.fullName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusBadge(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="truncate text-xs text-muted-foreground">{v.reviewNote || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(v.updatedAt || v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailModal(v)}
                        className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => fetchHistory(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <button
                onClick={() => fetchHistory(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Verification Details</h2>
              <button onClick={() => setDetailModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-px rounded-lg overflow-hidden bg-border mb-4">
              <button onClick={() => setPreviewImg(detailModal.frontSideUrl)} className="group relative aspect-[4/3] bg-muted">
                <img src={detailModal.frontSideUrl} alt="Front" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye className="h-5 w-5 text-foreground" />
                </div>
                <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground">Front</span>
              </button>
              <button onClick={() => setPreviewImg(detailModal.backSideUrl)} className="group relative aspect-[4/3] bg-muted">
                <img src={detailModal.backSideUrl} alt="Back" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye className="h-5 w-5 text-foreground" />
                </div>
                <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground">Back</span>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusBadge(detailModal.status)}`}>{detailModal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium text-foreground">{detailModal.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document</span>
                <span className="font-medium text-foreground">{detailModal.documentType} — <span className="font-mono">{detailModal.documentNumber}</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User</span>
                <span className="font-medium text-foreground">{detailModal.user.firstName} {detailModal.user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{detailModal.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="text-foreground">{new Date(detailModal.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed</span>
                <span className="text-foreground">{detailModal.updatedAt ? new Date(detailModal.updatedAt).toLocaleString() : '—'}</span>
              </div>
              {detailModal.reviewNote && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Review Note</p>
                  <p className="text-sm text-foreground">{detailModal.reviewNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm" onClick={() => setPreviewImg(null)}>
          <div className="relative max-h-[85vh] max-w-[85vw]">
            <img src={previewImg} alt="Document preview" className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl" />
            <button onClick={() => setPreviewImg(null)} className="absolute -right-3 -top-3 rounded-full bg-card p-1.5 shadow-lg border border-border text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
