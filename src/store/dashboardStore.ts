import { create } from 'zustand';

export type AssetType = 'Crypto' | 'Forex' | 'Gold';
export type WithdrawalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Withdrawal {
  id: string;
  traderId: string;
  userId: string;
  amount: number;
  date: string;
  assetType: AssetType;
  status: WithdrawalStatus;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  withdrawalId: string;
  traderId: string;
  userId: string;
  amount: number;
  assetType: AssetType;
  status: WithdrawalStatus;
  timestamp: string;
  read: boolean;
}

export interface QRCode {
  id: string;
  label: string;
  assetType: AssetType;
  imageUrl: string;
}

interface DashboardStore {
  withdrawals: Withdrawal[];
  admins: Admin[];
  notifications: Notification[];
  qrCodes: QRCode[];
  updateWithdrawalStatus: (id: string, status: WithdrawalStatus) => void;
  addAdmin: (admin: Omit<Admin, 'id' | 'createdAt'>) => void;
  updateAdmin: (id: string, data: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateQRCode: (id: string, imageUrl: string) => void;
}

const mockWithdrawals: Withdrawal[] = [
  { id: 'W001', traderId: 'T-1001', userId: 'U-5001', amount: 2500.00, date: '2026-02-06', assetType: 'Crypto', status: 'Pending' },
  { id: 'W002', traderId: 'T-1002', userId: 'U-5002', amount: 15000.00, date: '2026-02-05', assetType: 'Forex', status: 'Pending' },
  { id: 'W003', traderId: 'T-1003', userId: 'U-5003', amount: 850.50, date: '2026-02-05', assetType: 'Gold', status: 'Approved' },
  { id: 'W004', traderId: 'T-1004', userId: 'U-5004', amount: 5200.00, date: '2026-02-04', assetType: 'Crypto', status: 'Rejected' },
  { id: 'W005', traderId: 'T-1005', userId: 'U-5005', amount: 32000.00, date: '2026-02-04', assetType: 'Forex', status: 'Pending' },
  { id: 'W006', traderId: 'T-1006', userId: 'U-5006', amount: 1200.00, date: '2026-02-03', assetType: 'Gold', status: 'Pending' },
  { id: 'W007', traderId: 'T-1007', userId: 'U-5007', amount: 780.25, date: '2026-02-03', assetType: 'Crypto', status: 'Approved' },
  { id: 'W008', traderId: 'T-1008', userId: 'U-5008', amount: 44500.00, date: '2026-02-02', assetType: 'Forex', status: 'Pending' },
  { id: 'W009', traderId: 'T-1009', userId: 'U-5009', amount: 3100.00, date: '2026-02-02', assetType: 'Crypto', status: 'Rejected' },
  { id: 'W010', traderId: 'T-1010', userId: 'U-5010', amount: 9750.00, date: '2026-02-01', assetType: 'Gold', status: 'Pending' },
  { id: 'W011', traderId: 'T-1011', userId: 'U-5011', amount: 620.00, date: '2026-02-01', assetType: 'Crypto', status: 'Approved' },
  { id: 'W012', traderId: 'T-1012', userId: 'U-5012', amount: 18300.00, date: '2026-01-31', assetType: 'Forex', status: 'Pending' },
];

const mockAdmins: Admin[] = [
  { id: 'A001', name: 'Marcus Chen', email: 'marcus@tradepro.io', role: 'Senior Admin', createdAt: '2025-06-15' },
  { id: 'A002', name: 'Sarah Williams', email: 'sarah@tradepro.io', role: 'Admin', createdAt: '2025-09-20' },
  { id: 'A003', name: 'Alex Rivera', email: 'alex@tradepro.io', role: 'Junior Admin', createdAt: '2025-12-01' },
];

const mockQRCodes: QRCode[] = [
  { id: 'QR001', label: 'BTC Wallet', assetType: 'Crypto', imageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  { id: 'QR002', label: 'Forex Deposit', assetType: 'Forex', imageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FOREX-DEPOSIT-ACC-9281' },
  { id: 'QR003', label: 'Gold Reserve', assetType: 'Gold', imageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GOLD-RESERVE-VAULT-4421' },
];

const generateNotifications = (withdrawals: Withdrawal[]): Notification[] =>
  withdrawals.map((w, i) => ({
    id: `N${String(i + 1).padStart(3, '0')}`,
    withdrawalId: w.id,
    traderId: w.traderId,
    userId: w.userId,
    amount: w.amount,
    assetType: w.assetType,
    status: w.status,
    timestamp: new Date(w.date + 'T' + String(8 + i).padStart(2, '0') + ':30:00').toISOString(),
    read: w.status !== 'Pending',
  }));

export const useDashboardStore = create<DashboardStore>((set) => ({
  withdrawals: mockWithdrawals,
  admins: mockAdmins,
  notifications: generateNotifications(mockWithdrawals),
  qrCodes: mockQRCodes,

  updateWithdrawalStatus: (id, status) =>
    set((state) => {
      const withdrawals = state.withdrawals.map((w) =>
        w.id === id ? { ...w, status } : w
      );
      const withdrawal = withdrawals.find((w) => w.id === id)!;
      const newNotification: Notification = {
        id: `N${Date.now()}`,
        withdrawalId: id,
        traderId: withdrawal.traderId,
        userId: withdrawal.userId,
        amount: withdrawal.amount,
        assetType: withdrawal.assetType,
        status,
        timestamp: new Date().toISOString(),
        read: false,
      };
      return {
        withdrawals,
        notifications: [newNotification, ...state.notifications],
      };
    }),

  addAdmin: (admin) =>
    set((state) => ({
      admins: [
        ...state.admins,
        {
          ...admin,
          id: `A${String(state.admins.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
    })),

  updateAdmin: (id, data) =>
    set((state) => ({
      admins: state.admins.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),

  deleteAdmin: (id) =>
    set((state) => ({
      admins: state.admins.filter((a) => a.id !== id),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  updateQRCode: (id, imageUrl) =>
    set((state) => ({
      qrCodes: state.qrCodes.map((q) => (q.id === id ? { ...q, imageUrl } : q)),
    })),
}));
