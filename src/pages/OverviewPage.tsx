import { DashboardLayout } from '@/components/DashboardLayout';
import { useDashboardStore } from '@/store/dashboardStore';
import { ArrowLeftRight, Users, Bell, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OverviewPage() {
  const { withdrawals, admins, notifications } = useDashboardStore();

  const pending = withdrawals.filter((w) => w.status === 'Pending').length;
  const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const unread = notifications.filter((n) => !n.read).length;

  const stats = [
    { label: 'Total Withdrawals', value: withdrawals.length, icon: ArrowLeftRight, color: 'text-primary' },
    { label: 'Pending Requests', value: pending, icon: Clock, color: 'text-warning' },
    { label: 'Total Volume', value: `$${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
    { label: 'Active Admins', value: admins.length, icon: Users, color: 'text-primary' },
    { label: 'Unread Alerts', value: unread, icon: Bell, color: 'text-destructive' },
    { label: 'Approved Today', value: withdrawals.filter((w) => w.status === 'Approved').length, icon: TrendingUp, color: 'text-success' },
  ];

  const recentPending = withdrawals.filter((w) => w.status === 'Pending').slice(0, 5);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Super Admin</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Pending Withdrawals</h2>
          <Link to="/withdrawals" className="text-xs font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentPending.map((w) => (
            <div key={w.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">{w.traderId}</span>
                <span className="text-sm font-medium text-foreground">
                  ${w.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {w.assetType}
                </span>
                <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                  Pending
                </span>
              </div>
            </div>
          ))}
          {recentPending.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No pending withdrawals
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
