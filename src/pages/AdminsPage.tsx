import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  getAdminsAPI, createAdminAPI, deleteAdminAPI, resetAdminPasswordAPI,
  deactivateAdminAPI, activateAdminAPI,
  type AdminUser, type AdminListParams,
} from '@/lib/api';
import {
  Plus, Pencil, Trash2, X, KeyRound, Loader2, Search,
  ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, UserCheck, UserX,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('desc');
  const limit = 10;

  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'ADMIN' });

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminListParams = { page, limit, sort };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter;
      const res = await getAdminsAPI(params);
      setAdmins(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, sort]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openCreate = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', role: 'ADMIN' });
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createAdminAPI(form);
      toast.success('Admin created');
      setShowModal(false);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`Permanently delete ${admin.email}?`)) return;
    try {
      await deleteAdminAPI(admin.id);
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    try {
      if (admin.isActive) {
        await deactivateAdminAPI(admin.id);
        toast.success(`${admin.firstName} deactivated`);
      } else {
        await activateAdminAPI(admin.id);
        toast.success(`${admin.firstName} activated`);
      }
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetId || !newPassword) return;
    setActionLoading(true);
    try {
      await resetAdminPasswordAPI(resetId, newPassword);
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setActionLoading(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const selectCls = "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
          <p className="text-sm text-muted-foreground">{total} total admin{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Admin
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={selectCls}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">No admins found</td></tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{admin.firstName} {admin.lastName}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      admin.role === 'SUPER_ADMIN' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                    }`}>
                      {admin.role === 'SUPER_ADMIN' ? <ShieldCheck className="h-3 w-3" /> : null}
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      admin.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {admin.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleActive(admin)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" title={admin.isActive ? 'Deactivate' : 'Activate'}>
                        {admin.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => { setResetId(admin.id); setShowResetModal(true); }} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-warning/10 hover:text-warning" title="Reset Password">
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(admin)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Create Admin</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">First Name</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Last Name</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} required />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} required minLength={6} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${selectCls} w-full`}>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <button type="submit" disabled={actionLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Reset Password</h2>
              <button onClick={() => setShowResetModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} required minLength={6} />
              </div>
              <button type="submit" disabled={actionLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-warning py-2.5 text-sm font-semibold text-warning-foreground hover:bg-warning/90 disabled:opacity-50">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
