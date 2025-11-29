import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetailPage from './pages/ComplaintDetailPage'; // NEW: Import detail page
import Header from './components/Header';
import { Toaster } from 'sonner';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-complaint" element={<NewComplaint />} />
              {/* NEW: Route for viewing a single complaint's details */}
              <Route path="/complaint/:id" element={<ComplaintDetailPage />} />
            </>
          ) : (
            <Navigate to="/login" /> // Redirect to a login page if you have one
          )}
           {/* Add a fallback login route for when there's no user */}
          <Route path="/login" element={<div>Please log in to continue.</div>} />
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
