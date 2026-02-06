import { DashboardSidebar } from './DashboardSidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-64 min-h-screen p-6">{children}</main>
    </div>
  );
}
