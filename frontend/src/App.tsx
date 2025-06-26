import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

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
