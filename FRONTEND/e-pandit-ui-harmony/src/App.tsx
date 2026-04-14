import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import PriestsPage from "./pages/PriestsPage";
import PriestProfilePage from "./pages/PriestProfilePage";
import PoojaKitsPage from "./pages/PoojaKitsPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import UserProfilePage from "./pages/UserProfilePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import PanchangPage from "./pages/PanchangPage";
import BookPanditPage from "./pages/BookPanditPage";
import BookingTrackingPage from "./pages/BookingTrackingPage";
import PanditRegisterPage from "./pages/PanditRegisterPage";
import PanditDashboardPage from "./pages/PanditDashboardPage";
import ReviewPage from "./pages/ReviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/priests" element={<PriestsPage />} />
          <Route path="/priests/:id" element={<PriestProfilePage />} />
          <Route path="/pooja-kits" element={<PoojaKitsPage />} />
          <Route path="/panchang" element={<PanchangPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/verification" element={<AdminPanelPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* New booking flow routes */}
          <Route path="/book" element={<BookPanditPage />} />
          <Route path="/booking/:id" element={<BookingTrackingPage />} />
          <Route path="/review/:bookingId" element={<ReviewPage />} />
          {/* Pandit routes */}
          <Route path="/pandit/register" element={<PanditRegisterPage />} />
          <Route path="/pandit/dashboard" element={<PanditDashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
