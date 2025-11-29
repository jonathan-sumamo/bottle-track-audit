import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import Header from './components/Header';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div>Loading application...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && <Header />}
      <main className="p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-complaint" element={<NewComplaint />} />
            <Route path="/complaint/:id" element={<ComplaintDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors />
      </AuthProvider>
    </Router>
  );
};

export default App;
