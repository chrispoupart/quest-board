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
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    try {
                        const userData = await authService.getCurrentUser();
                        setUser(userData);
                    } catch (authError) {
                        console.error('AuthContext: Current user check failed:', authError);
                        // Try to refresh the token
                        try {
                            const refreshResult = await authService.refreshToken();
                            localStorage.setItem('accessToken', refreshResult.accessToken);
                            setUser(refreshResult.user);
                        } catch (refreshError) {
                            console.error('AuthContext: Token refresh failed:', refreshError);
                            // Clear tokens and redirect to login
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            setUser(null);
                        }
                    }
                }
            } catch (error) {
                console.error('AuthContext: Auth check failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (code: string, redirectUri: string) => {
        try {
            setLoading(true);
            const response = await authService.login(code, redirectUri);

            // Store tokens
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            setUser(response.user);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
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
