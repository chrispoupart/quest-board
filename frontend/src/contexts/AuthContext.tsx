import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface LoginData {
    token: string;
    name: string;
    level: number;
    progress: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => void;
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
                const token = localStorage.getItem('token');
                if (token) {
                    // With a backend-driven flow, we might need to verify the token
                    // or fetch user data on initial load.
                    // For now, we assume the token is valid if it exists.
                    // A robust implementation would call a `/me` endpoint.
                    const userData = await authService.getCurrentUser(); // This needs to use the new token
                    setUser(userData);
                }
            } catch (error) {
                console.error('AuthContext: Auth check failed:', error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (data: LoginData) => {
        localStorage.setItem('token', data.token);
        // We need to fetch the full user object or construct it from the login data
        // This is a simplified version. A real app might fetch from a /me endpoint.
        const partialUser: Partial<User> = {
            name: data.name,
            // Assuming level and progress can be stored directly or are part of a sub-object
        };
        // This is not a complete user object, so you might need to adjust your User type
        // or fetch the full user object after login.
        setUser(partialUser as User); 
        setLoading(false);
    };

    const logout = async () => {
        try {
            // Inform the backend about logout if necessary
            // await authService.logout(); 
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API call success
            setUser(null);
            localStorage.removeItem('token');
            // Also remove other related local storage items if any
            localStorage.removeItem('refreshToken'); // If you were using this
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user:', error);
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
