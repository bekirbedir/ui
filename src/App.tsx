import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/layout';
import LoginPage from './pages/LoginPage';
import LocationsPage from './pages/LocationsPage';
import TransportationsPage from './pages/TransportationsPage';
import RoutesPage from './pages/RoutesPage';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  console.log('ProtectedRoute - user:', user, 'isLoading:', isLoading);
  
  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }
  
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/routes" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  console.log('AppContent rendered');
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/routes" replace />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="locations" element={
          <AdminRoute>
            <LocationsPage />
          </AdminRoute>
        } />
        <Route path="transportations" element={
          <AdminRoute>
            <TransportationsPage />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  console.log('App rendered');
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;