import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import API from './api/axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Services from './pages/Services';
import Users from './pages/Users';
import Gallery from './pages/Gallery';
import ChangePassword from './pages/ChangePassword';
import AdminShell from './components/AdminShell';

const ProtectedAdmin = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/login" replace />;

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedAdmin>
          <AdminShell />
        </ProtectedAdmin>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="services" element={<Services />} />
      <Route path="gallery" element={<Gallery />} />
      <Route path="users" element={<Users />} />
      <Route path="change-password" element={<ChangePassword />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const warmAndPrefetch = async () => {
      await Promise.allSettled([
        API.get('/health'),
        API.get('/admin/services'),
        API.get('/admin/bookings'),
        API.get('/images'),
      ]);
    };

    void warmAndPrefetch();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
