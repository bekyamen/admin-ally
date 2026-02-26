import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users, Wallet, ArrowDownCircle, ArrowUpCircle, LayoutDashboard, Shield, LogOut, History, FileCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admins', icon: Users, label: 'Admins' },
  { to: '/deposit-wallets', icon: Wallet, label: 'Deposit Wallets' },
  { to: '/pending-deposits', icon: ArrowDownCircle, label: 'Pending Deposits' },
  { to: '/deposit-history', icon: History, label: 'Deposit History' },
  { to: '/pending-withdrawals', icon: ArrowUpCircle, label: 'Pending Withdrawals' },
  { to: '/withdraw-history', icon: History, label: 'Withdraw History' },
  { to: '/verifications', icon: FileCheck, label: 'KYC Verifications' },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">TradePro</h1>
          <p className="text-xs text-muted-foreground">Super Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {user?.firstName?.[0] || 'S'}{user?.lastName?.[0] || 'A'}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'admin@tradepro.io'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
