import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import AdminsPage from "./pages/AdminsPage";
import NotificationsPage from "./pages/NotificationsPage";
import QRCodesPage from "./pages/QRCodesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/qr-codes" element={<QRCodesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
