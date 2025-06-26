import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import QuestBoard from './components/quest-board';
import Dashboard from './components/dashboard/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import { Store } from './components/Store';
import CharacterSheet from './components/CharacterSheet';

// Placeholder components for other pages with fantasy theme

const QuestsPage = () => <QuestBoard />;

const StorePage = () => {
  const { user } = useAuth();
  return user ? <Store user={user} /> : null;
};

const ProfilePage = () => <CharacterSheet />;

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
          <Toaster position="top-right" richColors />
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
              path="/store"
              element={
                <ProtectedRoute>
                  <div>
                    <Header />
                    <main>
                      <StorePage />
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
                    <main>
                      <AdminPanel />
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
