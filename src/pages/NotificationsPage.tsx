import { DashboardLayout } from '@/components/DashboardLayout';
import { useDashboardStore } from '@/store/dashboardStore';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDashboardStore();
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read).length;

  const handleClick = (n: (typeof notifications)[0]) => {
    markNotificationRead(n.id);
    navigate('/withdrawals');
  };

  const statusColor = {
    Pending: 'text-warning',
    Approved: 'text-success',
    Rejected: 'text-destructive',
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
              n.read
                ? 'border-border bg-card hover:bg-muted/30'
                : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
            }`}
          >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              n.read ? 'bg-secondary' : 'bg-primary/20'
            }`}>
              <Bell className={`h-4 w-4 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{n.traderId}</span>
                <span className="text-muted-foreground"> ({n.userId}) </span>
                requested withdrawal of{' '}
                <span className="font-semibold">${n.amount.toLocaleString()}</span>
                {' '}in <span className="font-medium">{n.assetType}</span>
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className={`text-xs font-semibold ${statusColor[n.status]}`}>{n.status}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(n.timestamp), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            </div>
            {!n.read && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse-glow" />
            )}
          </button>
        ))}
      </div>
    </DashboardLayout>
  );
}
