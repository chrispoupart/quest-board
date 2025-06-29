import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (code: string, redirectUri: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUser: (userData: User) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isEditorOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in on app start
        const checkAuth = async () => {
            setLoading(true);
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken) {
                    try {
                        // Validate token locally first (optional, but good for quick check)
                        // For now, directly try to get user data
                        const userData = await authService.getCurrentUser();
                        setUser(userData);
                    } catch (authError) {
                        console.warn('AuthContext: Current user check failed, attempting token refresh:', authError);
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (refreshToken) {
                            try {
                                const refreshResult = await authService.refreshToken(); // This now returns { accessToken, user (optional) }
                                localStorage.setItem('accessToken', refreshResult.accessToken);
                                // After refreshing, refetch user data with new token
                                const userData = await authService.getCurrentUser();
                                setUser(userData);
                            } catch (refreshError) {
                                console.error('AuthContext: Token refresh failed:', refreshError);
                                // Clear tokens and effectively log out user
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                setUser(null);
                                // Optionally redirect to login: window.location.href = '/login';
                            }
                        } else {
                             // No refresh token, so clear tokens and log out
                            localStorage.removeItem('accessToken');
                            setUser(null);
                        }
                    }
                }
            } catch (error) {
                // This catch is for unexpected errors during the auth check process itself
                console.error('AuthContext: Auth check process failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // The login function is not directly used in the Google OAuth flow with redirects.
    // Token handling happens in LoginPage or a callback component.
    // This login function stub might be for a different auth method (e.g. username/password)
    // or needs to be adapted if it's intended for post-OAuth callback processing.
    // For now, ensuring token storage is handled correctly upon redirect is key.
    const login = async (_code: string, _redirectUri: string) => {
        // TODO: This function's role might need re-evaluation based on actual usage.
        // The primary "login" action for Google OAuth is the redirect to Google,
        // and then handling the callback where tokens are received.
        // If this function is called from a callback page, it would make more sense.
        console.warn("AuthContext login function called. Ensure it's used appropriately in the OAuth flow.");
        // For now, let's assume it's a placeholder or for a different flow.
        // The critical part is that tokens from URL are stored by the component handling the callback.
    };

    const logout = async () => {
        try {
            if (user) {
                await authService.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API call success
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    const refreshUser = async () => {
        try {
            console.log('AuthContext: refreshUser called, fetching user data...');
            const userData = await authService.getCurrentUser();
            console.log('AuthContext: User data received:', userData);
            setUser(userData);
        } catch (error) {
            console.error('AuthContext: Failed to refresh user:', error);
            // If refresh fails, logout the user
            await logout();
        }
    };

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'ADMIN';
    const isEditorOrAdmin = user?.role === 'ADMIN' || user?.role === 'EDITOR';

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        updateUser,
        isAuthenticated,
        isAdmin,
        isEditorOrAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
