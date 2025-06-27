import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scroll, Shield, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const { login, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        console.log('LoginPage useEffect - isAuthenticated:', isAuthenticated, 'loading:', loading);

        // If user is already authenticated, redirect to dashboard
        if (isAuthenticated) {
            console.log('User is authenticated, redirecting to dashboard');
            navigate('/dashboard');
            return;
        }

        // Check for Google OAuth2 callback
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        console.log('URL params - code:', code ? 'present' : 'not present', 'error:', error);

        if (error) {
            console.error('OAuth error:', error);
            // Handle OAuth error (could show a toast notification)
            return;
        }

        if (code) {
            console.log('Found OAuth code, attempting login...');
            handleGoogleCallback(code);
        }
    }, [isAuthenticated, navigate, searchParams]);

    const handleGoogleCallback = async (code: string) => {
        try {
            console.log('Starting Google callback with code length:', code.length);
            const redirectUri = `${window.location.origin}/auth/callback`;
            console.log('Redirect URI:', redirectUri);

            await login(code, redirectUri);
            console.log('Login successful, redirecting to dashboard');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            // Handle login error (could show a toast notification)
        }
    };

    const handleGoogleLogin = () => {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/callback`;
        const scope = 'email profile';
        const responseType = 'code';

        console.log('Starting Google login with client ID:', googleClientId);
        console.log('Redirect URI:', redirectUri);

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${googleClientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(scope)}&` +
            `response_type=${responseType}&` +
            `access_type=offline&` +
            `prompt=consent`;

        console.log('Google Auth URL:', googleAuthUrl);
        window.location.href = googleAuthUrl;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-amber-800 font-medium">Preparing your adventure...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200 rounded-full opacity-20 blur-xl"></div>
                    <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-200 rounded-full opacity-20 blur-xl"></div>
                </div>

                <div className="relative">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 shadow-lg border-4 border-amber-200">
                            <Scroll className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="mt-6 text-center text-4xl font-bold text-amber-900 font-serif">
                            Quest Board
                        </h1>
                        <p className="mt-3 text-center text-lg text-amber-700">
                            Join the Guild of Adventurers
                        </p>
                        <p className="mt-1 text-center text-sm text-amber-600">
                            Complete quests, earn bounty, and build your legend
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="mt-8 fantasy-card rounded-lg p-8">
                        <div className="space-y-6">
                            {/* Role Selection Visual */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-3 bg-amber-100 rounded-lg border border-amber-200">
                                    <Crown className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                                    <div className="text-xs text-amber-700 font-medium">Guild Master</div>
                                </div>
                                <div className="text-center p-3 bg-amber-100 rounded-lg border border-amber-200">
                                    <Scroll className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                                    <div className="text-xs text-amber-700 font-medium">Quest Giver</div>
                                </div>
                                <div className="text-center p-3 bg-amber-100 rounded-lg border border-amber-200">
                                    <Shield className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                                    <div className="text-xs text-amber-700 font-medium">Adventurer</div>
                                </div>
                            </div>

                            {/* Login Button */}
                            <div>
                                <button
                                    onClick={handleGoogleLogin}
                                    className="group relative w-full flex justify-center py-4 px-6 border-2 border-amber-600 text-lg font-medium rounded-lg text-white bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                >
                                    <svg
                                        className="w-6 h-6 mr-3"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Enter with Google Credentials
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="text-center pt-4 border-t border-amber-200">
                                <p className="text-xs text-amber-600">
                                    By joining the guild, you pledge to uphold the ancient codes of honor
                                </p>
                                <p className="text-xs text-amber-500 mt-1">
                                    Terms of service • Privacy charter
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
