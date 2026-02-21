import { DashboardLayout } from '@/components/DashboardLayout';
import { Users, Wallet, ArrowDownCircle, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user);

  const quickLinks = [
    { label: 'Manage Admins', icon: Users, to: '/admins', desc: 'Create, edit, delete admin accounts' },
    { label: 'Deposit Wallets', icon: Wallet, to: '/deposit-wallets', desc: 'Manage wallet addresses and QR codes' },
    { label: 'Pending Deposits', icon: ArrowDownCircle, to: '/pending-deposits', desc: 'Approve or reject deposit requests' },
    { label: 'Deposit History', icon: History, to: '/deposit-history', desc: 'View all approved and rejected deposits' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName || 'Super Admin'}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
          >
            <link.icon className="mb-3 h-8 w-8 text-primary" />
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">{link.label}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
