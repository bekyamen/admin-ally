const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  throw new Error('API base URL is not defined in environment variables');
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
}

// ─── Auth ───
export async function loginAPI(email: string, password: string) {
  const res = await request<{
    success: boolean;
    data: {
      user: { id: string; email: string; firstName: string; lastName: string; role: string };
      token: string;
    };
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

// ─── Admin Management ───
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  passwordUpdatedAt?: string;
  forcePasswordReset?: boolean;
}

export interface AdminListResponse {
  success: boolean;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  data: AdminUser[];
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
  sort?: string;
}

export async function getAdminsAPI(params: AdminListParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.isActive) query.set('isActive', params.isActive);
  if (params.sort) query.set('sort', params.sort);
  const qs = query.toString();
  return request<AdminListResponse>(`/super-admin/users${qs ? `?${qs}` : ''}`);
}

export async function createAdminAPI(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  return request<{ success: boolean; message: string; data: AdminUser }>('/super-admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resetAdminPasswordAPI(id: string, newPassword: string) {
  return request<{ success: boolean; message: string }>(`/super-admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
}

export async function deactivateAdminAPI(id: string) {
  return request<{ success: boolean; message: string }>(`/super-admin/users/${id}/deactivate`, {
    method: 'PUT',
  });
}

export async function activateAdminAPI(id: string) {
  return request<{ success: boolean; message: string }>(`/super-admin/users/${id}/activate`, {
    method: 'PUT',
  });
}

export async function deleteAdminAPI(id: string) {
  return request<{ success: boolean; message: string }>(`/super-admin/users/${id}`, {
    method: 'DELETE',
  });
}

// ─── Deposit Wallets ───
export interface DepositWallet {
  id: string;
  coin: string;
  address: string;
  qrImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function createDepositWalletAPI(coin: string, address: string, qrImage: File) {
  const formData = new FormData();
  formData.append('coin', coin);
  formData.append('address', address);
  formData.append('qrImage', qrImage);
  return request<{ success: boolean; message: string; data: DepositWallet }>('/admin/deposit/deposit-wallet', {
    method: 'POST',
    body: formData,
  });
}

export async function editDepositWalletAPI(coin: string, address?: string, qrImage?: File) {
  const formData = new FormData();
  if (address) formData.append('address', address);
  if (qrImage) formData.append('qrImage', qrImage);
  return request<{ success: boolean; message: string; data: DepositWallet }>(`/admin/deposit/deposit-wallet/${coin}`, {
    method: 'PUT',
    body: formData,
  });
}

export async function deleteDepositWalletAPI(coin: string) {
  return request<{ success: boolean; message: string }>(`/admin/deposit/deposit-wallet/${coin}`, {
    method: 'DELETE',
  });
}

// ─── Deposits ───
export interface DepositUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  role: string;
}

export interface Deposit {
  id: string;
  userId: string;
  walletId?: string;
  coin: string;
  amount: number;
  transactionHash: string;
  proofImage?: string;
  status: string;
  reviewNote?: string;
  user: DepositUser;
  wallet?: DepositWallet;
}

export async function getPendingDepositsAPI() {
  return request<{ success: boolean; data: Deposit[] }>('/admin/deposit/pending');
}

export async function approveDepositAPI(id: string) {
  return request<{ success: boolean; message: string }>(`/admin/deposit/approve/${id}`, {
    method: 'PUT',
  });
}

export async function rejectDepositAPI(id: string, reviewNote?: string) {
  return request<{ success: boolean; message: string }>(`/admin/deposit/reject/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reviewNote ? { reviewNote } : {}),
  });
}

export async function getDepositHistoryAPI() {
  return request<{ success: boolean; data: Deposit[] }>('/admin/deposit/history');
}

export async function getDepositByIdAPI(id: string) {
  return request<{ success: boolean; data: Deposit }>(`/admin/deposit/get/${id}`);
}
