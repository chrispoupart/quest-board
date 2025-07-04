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
import { Store } from './components/Store';
import CharacterSheet from './components/CharacterSheet';
import { lazy } from 'react';

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
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    console.log('AuthCallback: Received accessToken:', accessToken ? 'present' : 'not present');
    console.log('AuthCallback: Received refreshToken:', refreshToken ? 'present' : 'not present');
    console.log('AuthCallback: Received error:', error);
    // console.log('AuthCallback: All search params:', Object.fromEntries(searchParams.entries())); // Optional: for debugging

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (accessToken && refreshToken) {
      console.log('AuthCallback: Storing tokens and fetching user data...');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user data using the new accessToken
      refreshUser()
        .then(() => {
          console.log('AuthCallback: Successfully authenticated, redirecting to dashboard');
          navigate('/dashboard');
        })
        .catch((fetchError) => {
          console.error('AuthCallback: Failed to fetch user data after storing tokens:', fetchError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login?error=' + encodeURIComponent('Failed to authenticate after token storage'));
        });
    } else if (accessToken && !refreshToken) {
        // This case should ideally not happen if backend sends both or none.
        console.warn('AuthCallback: Received accessToken but no refreshToken. This might indicate an issue.');
        // Decide if you want to proceed with only accessToken or treat as error
        localStorage.setItem('accessToken', accessToken);
        // Potentially clear any old refresh token
        localStorage.removeItem('refreshToken');
         refreshUser()
        .then(() => navigate('/dashboard'))
        .catch(() => navigate('/login?error=auth_incomplete'));

    } else {
      console.log('AuthCallback: No tokens found (accessToken or refreshToken missing), redirecting to login');
      navigate('/login?error=' + encodeURIComponent('Authentication tokens missing'));
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

const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));

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
                        <React.Suspense fallback={<div className="p-8 text-center">Loading admin panel...</div>}>
                          <AdminPanel />
                        </React.Suspense>
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
