import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlumniProvider } from "@/contexts/AlumniContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import ValidasiPage from "./pages/ValidasiPage";
import UserDashboard from "./pages/UserDashboard";
import FormPage from "./pages/FormPage";
import PrestasiPage from "./pages/PrestasiPage";
import CareerHistoryPage from "./pages/CareerHistoryPage";
import EvaluationSurveyPage from "./pages/EvaluationSurveyPage";
import AdminDashboard from "./pages/AdminDashboard";
import AIInsightPage from "./pages/AIInsightPage";
import AdminInsightDashboard from "./pages/AdminInsightDashboard";
import AdminEvaluasiLulusanPage from "./pages/AdminEvaluasiLulusanPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AlumniProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/validasi" element={<ValidasiPage />} />
            
            {/* Student protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="student">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/form" element={
              <ProtectedRoute requiredRole="student">
                <FormPage />
              </ProtectedRoute>
            } />
            <Route path="/prestasi" element={
              <ProtectedRoute requiredRole="student">
                <PrestasiPage />
              </ProtectedRoute>
            } />
            <Route path="/riwayat-karir" element={
              <ProtectedRoute requiredRole="student">
                <CareerHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/evaluasi-lulusan/survey/:token" element={
              <ProtectedRoute requiredRole="student">
                <EvaluationSurveyPage />
              </ProtectedRoute>
            } />
            
            {/* Admin protected routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminInsightDashboard />} />
              <Route path="dashboard/:section" element={<AdminInsightDashboard />} />
              <Route path="pengelola-mahasiswa" element={<AdminDashboard />} />
              <Route path="ai-insight" element={<AIInsightPage />} />
              <Route path="evaluasi-lulusan" element={<AdminEvaluasiLulusanPage />} />
              <Route path="insight-dashboard" element={<Navigate to="/admin/pengelola-mahasiswa" replace />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AlumniProvider>
  );
}

export default App;
