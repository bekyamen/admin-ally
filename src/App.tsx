import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import AdminsPage from "./pages/AdminsPage";
import DepositWalletsPage from "./pages/DepositWalletsPage";
import PendingDepositsPage from "./pages/PendingDepositsPage";
import DepositHistoryPage from "./pages/DepositHistoryPage";
import PendingWithdrawalsPage from "./pages/PendingWithdrawalsPage";
import WithdrawHistoryPage from "./pages/WithdrawHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
            <Route path="/admins" element={<ProtectedRoute><AdminsPage /></ProtectedRoute>} />
            <Route path="/deposit-wallets" element={<ProtectedRoute><DepositWalletsPage /></ProtectedRoute>} />
            <Route path="/pending-deposits" element={<ProtectedRoute><PendingDepositsPage /></ProtectedRoute>} />
            <Route path="/deposit-history" element={<ProtectedRoute><DepositHistoryPage /></ProtectedRoute>} />
            <Route path="/pending-withdrawals" element={<ProtectedRoute><PendingWithdrawalsPage /></ProtectedRoute>} />
            <Route path="/withdraw-history" element={<ProtectedRoute><WithdrawHistoryPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
