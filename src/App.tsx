import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Membership from "@/pages/Membership";
import AllDietPlan from "@/pages/AllDietPlan";
import Diet from "@/pages/Diet";
import AllWorkout from "@/pages/AllWorkout";
import NotFound from "./pages/NotFound";
import NewCustomer from "@/pages/NewCustomer";
import AdminQR from "@/pages/AdminQR";
import AdminCustomers from "@/pages/AdminCustomers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public route - no layout */}
          <Route path="/new-customer" element={<NewCustomer />} />

          {/* Admin routes - with layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/all-diet-plan" element={<AllDietPlan />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/all-workout" element={<AllWorkout />} />
            <Route path="/admin/qr" element={<AdminQR />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
