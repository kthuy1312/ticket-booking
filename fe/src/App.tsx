import { BrowserRouter, Route, Routes, Navigate } from 'react-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ConcertsPage from '@/pages/ConcertsPage';
import ConcertDetailPage from '@/pages/ConcertDetailPage';
import MyBookingsPage from '@/pages/MyBookingsPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminConcerts from '@/pages/admin/AdminConcerts';
import AdminBookings from '@/pages/admin/AdminBookings';
import AdminVouchers from '@/pages/admin/AdminVouchers';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, token, loading } = useAuthStore();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  const { fetchMe, token } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (token) fetchMe();
  }, [token, fetchMe]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ConcertsPage />} />
            <Route path="concerts/:id" element={<ConcertDetailPage />} />
            <Route 
              path="my-bookings" 
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="concerts" element={<AdminConcerts />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="vouchers" element={<AdminVouchers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
