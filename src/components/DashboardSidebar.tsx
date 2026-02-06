import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  Users,
  Bell,
  QrCode,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/withdrawals', icon: ArrowLeftRight, label: 'Withdrawals' },
  { to: '/admins', icon: Users, label: 'Admins' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/qr-codes', icon: QrCode, label: 'QR Codes' },
];

export function DashboardSidebar() {
  const location = useLocation();
  const unreadCount = useDashboardStore(
    (s) => s.notifications.filter((n) => !n.read).length
  );

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
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            SA
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Super Admin</p>
            <p className="text-xs text-muted-foreground">admin@tradepro.io</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
