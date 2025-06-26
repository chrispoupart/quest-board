import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';

// Placeholder components for other pages
const DashboardPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Dashboard content coming soon...</p>
  </div>
);

const QuestsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Quests</h1>
    <p>Quest board coming soon...</p>
  </div>
);

const AdminPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
    <p>Admin interface coming soon...</p>
  </div>
);

const ProfilePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
    <p>Profile settings coming soon...</p>
  </div>
);

// Auth callback component that redirects to login with the code
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (code) {
      // Redirect to login page with the code
      navigate(`/login?code=${encodeURIComponent(code)}`);
    } else {
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>
                    <Header />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <DashboardPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quests"
              element={
                <ProtectedRoute>
                  <div>
                    <Header />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <QuestsPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireEditorOrAdmin>
                  <div>
                    <Header />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <AdminPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>
                    <Header />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <ProfilePage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
