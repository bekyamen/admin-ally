import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Check, X, Loader2, RefreshCw, Eye, FileCheck, ChevronLeft, ChevronRight } from 'lucide-react';
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

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
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

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ id: string; action: 'APPROVED' | 'REJECTED' } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, pages: 1 });

  const fetchPending = async (page = 1) => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(`${API_BASE}/identity-verification/pending?page=${page}&limit=10`);
      setVerifications(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleReview = async () => {
    if (!reviewModal) return;
    setActionId(reviewModal.id);
    try {
      await fetchWithAuth(`${API_BASE}/identity-verification/review/${reviewModal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: reviewModal.action, reviewNote: reviewNote || undefined }),
      });
      toast.success(`Verification ${reviewModal.action.toLowerCase()}`);
      setVerifications((prev) => prev.filter((v) => v.id !== reviewModal.id));
      setReviewModal(null);
      setReviewNote('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to review');
    } finally {
      setActionId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-600',
      APPROVED: 'bg-emerald-500/10 text-emerald-600',
      REJECTED: 'bg-destructive/10 text-destructive',
    };
    return map[status] || 'bg-secondary text-secondary-foreground';
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">KYC Verifications</h1>
          <p className="text-sm text-muted-foreground">Review and manage user identity verifications</p>
        </div>
        <button onClick={() => fetchPending(pagination.page)} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <FileCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No pending verifications</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {verifications.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
                {/* Document images */}
                <div className="grid grid-cols-2 gap-px bg-border">
                  <button onClick={() => setPreviewImg(v.frontSideUrl)} className="group relative aspect-[4/3] overflow-hidden bg-muted">
                    <img src={v.frontSideUrl} alt="Front side" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground">Front</span>
                  </button>
                  <button onClick={() => setPreviewImg(v.backSideUrl)} className="group relative aspect-[4/3] overflow-hidden bg-muted">
                    <img src={v.backSideUrl} alt="Back side" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground">Back</span>
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{v.fullName}</p>
                      <p className="text-xs text-muted-foreground">{v.user.email}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge(v.status)}`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Doc Type</p>
                      <p className="font-medium text-foreground">{v.documentType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Doc Number</p>
                      <p className="font-medium text-foreground font-mono">{v.documentNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">User Name</p>
                      <p className="font-medium text-foreground">{v.user.firstName} {v.user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium text-foreground">{new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {v.status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setReviewModal({ id: v.id, action: 'APPROVED' }); setReviewNote(''); }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => { setReviewModal({ id: v.id, action: 'REJECTED' }); setReviewNote(''); }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive/10 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => fetchPending(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchPending(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {reviewModal.action === 'APPROVED' ? 'Approve' : 'Reject'} Verification
              </h2>
              <button onClick={() => { setReviewModal(null); setReviewNote(''); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Review Note</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={reviewModal.action === 'APPROVED' ? 'Documents verified successfully' : 'Reason for rejection...'}
                />
              </div>
              <button
                onClick={handleReview}
                disabled={actionId === reviewModal.id}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  reviewModal.action === 'APPROVED'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                }`}
              >
                {actionId === reviewModal.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : reviewModal.action === 'APPROVED' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Confirm {reviewModal.action === 'APPROVED' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm" onClick={() => setPreviewImg(null)}>
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
