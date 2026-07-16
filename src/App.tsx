import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
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
import AdminHistoryLogbookPage from "./pages/AdminHistoryLogbookPage";
import AdminKustomFormKepuasanPage from "./pages/AdminKustomFormKepuasanPage";
import AdminKustomFormBuilderPage from "./pages/AdminKustomFormBuilderPage";
import AdminSelectDashboardPage from "./pages/AdminSelectDashboardPage";
import AdminDosenDashboardPage from "./pages/AdminDosenDashboardPage";
import AdminKustomFormPreviewPage from "./pages/AdminKustomFormPreviewPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StudentLayout } from "@/components/student/StudentLayout";
import NotFound from "./pages/NotFound";

// Redirect helpers with params matching for backward compatibility
function NavigateToInsightDashboard() {
  const { section } = useParams<{ section?: string }>();
  return <Navigate to={`/admin/mahasiswa/dashboard/${section || 'all'}`} replace />;
}

function NavigateToPreviewId() {
  const { id } = useParams<{ id?: string }>();
  return <Navigate to={`/admin/mahasiswa/kustom-form/preview/${id || ''}`} replace />;
}

function NavigateToEditId() {
  const { id } = useParams<{ id?: string }>();
  return <Navigate to={`/admin/mahasiswa/kustom-form/edit/${id || ''}`} replace />;
}

function App() {
  return (
    <AlumniProvider>
      <TooltipProvider>
        <BrowserRouter basename={(import.meta.env.BASE_URL || "/").replace(/\/+$/, "")}>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/validasi" element={<ValidasiPage />} />
            <Route path="/evaluasi" element={<EvaluationSurveyPage />} />
            
            {/* Student protected routes */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="form" element={<FormPage />} />
              <Route path="prestasi" element={<PrestasiPage />} />
              <Route path="riwayat-karir" element={<CareerHistoryPage />} />
            </Route>

            {/* Student redirects for backward compatibility */}
            <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/form" element={<Navigate to="/student/form" replace />} />
            <Route path="/prestasi" element={<Navigate to="/student/prestasi" replace />} />
            <Route path="/riwayat-karir" element={<Navigate to="/student/riwayat-karir" replace />} />
            
            <Route path="/evaluasi-lulusan/survey/:token" element={<EvaluationSurveyPage />} />
            
            {/* Admin protected routes */}
            <Route path="/admin/select-dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSelectDashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/select-dashboard" replace />} />
              
              {/* Dosen Section */}
              <Route path="dosen">
                <Route index element={<Navigate to="pengelolaan" replace />} />
                <Route path="pengelolaan" element={<AdminDosenDashboardPage />} />
              </Route>
              
              {/* Mahasiswa Section */}
              <Route path="mahasiswa">
                <Route index element={<Navigate to="dashboard/all" replace />} />
                <Route path="dashboard/:section" element={<AdminInsightDashboard />} />
                <Route path="pengelola" element={<AdminDashboard />} />
                <Route path="ai-insight" element={<AIInsightPage />} />
                <Route path="evaluasi" element={<AdminEvaluasiLulusanPage />} />
                <Route path="kustom-form/preview/:id" element={<AdminKustomFormPreviewPage />} />
                <Route path="kustom-form/preview" element={<AdminKustomFormPreviewPage />} />
                <Route path="kustom-form/edit/:id" element={<AdminKustomFormBuilderPage />} />
                <Route path="kustom-form/new" element={<AdminKustomFormBuilderPage />} />
                <Route path="kustom-form" element={<AdminKustomFormKepuasanPage />} />
                <Route path="history-logbook" element={<AdminHistoryLogbookPage />} />
              </Route>

              {/* Admin redirects for backward compatibility */}
              <Route path="dosen-dashboard/pengelolaan-dosen" element={<Navigate to="/admin/dosen/pengelolaan" replace />} />
              <Route path="dosen-dashboard" element={<Navigate to="/admin/dosen/pengelolaan" replace />} />
              <Route path="mahasiswa-dashboard/:section" element={<NavigateToInsightDashboard />} />
              <Route path="pengelola-mahasiswa" element={<Navigate to="/admin/mahasiswa/pengelola" replace />} />
              <Route path="ai-insight" element={<Navigate to="/admin/mahasiswa/ai-insight" replace />} />
              <Route path="evaluasi-lulusan" element={<Navigate to="/admin/mahasiswa/evaluasi" replace />} />
              <Route path="kustom-form-kepuasan/preview/:id" element={<NavigateToPreviewId />} />
              <Route path="kustom-form-kepuasan/preview" element={<Navigate to="/admin/mahasiswa/kustom-form/preview" replace />} />
              <Route path="kustom-form-kepuasan/edit/:id" element={<NavigateToEditId />} />
              <Route path="kustom-form-kepuasan/new" element={<Navigate to="/admin/mahasiswa/kustom-form/new" replace />} />
              <Route path="kustom-form-kepuasan" element={<Navigate to="/admin/mahasiswa/kustom-form" replace />} />
              <Route path="history-logbook" element={<Navigate to="/admin/mahasiswa/history-logbook" replace />} />
              <Route path="import-prestasi" element={<Navigate to="/admin/mahasiswa/dashboard/student-achievements" replace />} />
              <Route path="insight-dashboard" element={<Navigate to="/admin/mahasiswa/pengelola" replace />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AlumniProvider>
  );
}

export default App;
