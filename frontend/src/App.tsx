import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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

// Auth callback component that handles the token from backend
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  React.useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('AuthCallback: Received token:', token ? 'present' : 'not present');
    console.log('AuthCallback: Received error:', error);
    console.log('AuthCallback: All search params:', Object.fromEntries(searchParams.entries()));

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      console.log('AuthCallback: Storing token and fetching user data...');
      // Backend has already handled the OAuth flow and sent us a token
      // Store the token
      localStorage.setItem('accessToken', token);

      // Fetch user data using the token
      refreshUser()
        .then(() => {
          console.log('AuthCallback: Successfully authenticated, redirecting to dashboard');
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('AuthCallback: Failed to fetch user data:', error);
          // Clear token and redirect to login
          localStorage.removeItem('accessToken');
          navigate('/login?error=' + encodeURIComponent('Failed to authenticate'));
        });
    } else {
      console.log('AuthCallback: No token found, redirecting to login');
      // No token, redirect to login
      navigate('/login');
    }
  }, [navigate, searchParams, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-amber-700">Processing authentication...</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
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
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
