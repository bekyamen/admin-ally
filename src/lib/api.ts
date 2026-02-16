const API_BASE = 'http://localhost:5000/api';

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

  // Don't set Content-Type for FormData (browser sets it with boundary)
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

// Auth
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

// Admin Management
export async function createAdminAPI(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  return request<{ message: string; userId: string }>('/super-admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminAPI(id: string, data: Record<string, string>) {
  return request(`/super-admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminAPI(id: string) {
  return request<{ message: string }>(`/super-admin/users/${id}`, {
    method: 'DELETE',
  });
}

export async function resetAdminPasswordAPI(id: string, newPassword: string) {
  return request<{ message: string }>(`/super-admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
}

// Deposit Wallets
export async function createDepositWalletAPI(coin: string, address: string, qrImage: File) {
  const formData = new FormData();
  formData.append('coin', coin);
  formData.append('address', address);
  formData.append('qrImage', qrImage);

  return request<{
    success: boolean;
    data: {
      id: string;
      coin: string;
      address: string;
      qrImage: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }>('/admin/deposit/deposit-wallet', {
    method: 'POST',
    body: formData,
  });
}

// Pending Deposits
export async function getPendingDepositsAPI() {
  return request<{
    success: boolean;
    data: Array<{
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
    }>;
  }>('/admin/deposit/pending');
}

export async function approveDepositAPI(id: string) {
  return request<{ success: boolean; message: string }>(`/admin/deposit/approve/${id}`, {
    method: 'POST',
  });
}

export async function rejectDepositAPI(id: string) {
  return request<{ success: boolean; message: string }>(`/admin/deposit/reject/${id}`, {
    method: 'POST',
  });
}
