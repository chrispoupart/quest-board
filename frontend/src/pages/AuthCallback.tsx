import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const name = searchParams.get('name');
        const level = searchParams.get('level');
        const progress = searchParams.get('progress');

        if (token && name && level && progress) {
            login({ token, name, level: parseInt(level, 10), progress: parseInt(progress, 10) });
            navigate('/dashboard');
        } else {
            // Handle error or missing token
            console.error('Authentication callback is missing required parameters.');
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Please wait while we log you in...</p>
        </div>
    );
};

const AuthCallbackPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <AuthCallback />
    </Suspense>
);

export default AuthCallbackPage; 
