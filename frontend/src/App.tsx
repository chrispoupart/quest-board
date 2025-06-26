import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import QuestBoard from './components/quest-board';
import Dashboard from './components/dashboard/Dashboard';

// Placeholder components for other pages with fantasy theme

const QuestsPage = () => <QuestBoard />;

const AdminPage = () => (
  <div className="p-6 min-h-screen">
    <div className="fantasy-card rounded-lg p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-amber-900 font-serif">Guild Hall</h1>
      <p className="text-amber-700 text-lg">Administrative tools and guild management are being forged...</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900">Quest Management</h3>
          <p className="text-amber-600">Coming soon</p>
        </div>
        <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900">User Permissions</h3>
          <p className="text-amber-600">Coming soon</p>
        </div>
      </div>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="p-6 min-h-screen">
    <div className="fantasy-card rounded-lg p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-amber-900 font-serif">Character Sheet</h1>
      <p className="text-amber-700 text-lg">Your personal profile and settings scroll is being inscribed...</p>
      <div className="mt-6 space-y-4">
        <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900">Personal Information</h3>
          <p className="text-amber-600">Coming soon</p>
        </div>
        <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900">Preferences</h3>
          <p className="text-amber-600">Coming soon</p>
        </div>
      </div>
    </div>
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
        <div className="min-h-screen">
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
                    <main>
                      <Dashboard />
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
                    <main>
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
