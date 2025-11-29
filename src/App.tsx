import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewComplaint from './pages/NewComplaint';

export default function App() {
  return (
    <Router>
      <Toaster richColors />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-complaint" element={<NewComplaint />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}