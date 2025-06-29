import React from 'react';
import { Scroll, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-xl border-2 border-border text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <Crown size={32} className="text-primary-foreground" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-foreground font-serif tracking-tight">Welcome to Quest Board</h1>
                <p className="text-lg text-muted-foreground">
                    Your adventure awaits. Complete quests, earn rewards, and level up your skills.
                </p>

                <div className="pt-6">
                    <a href="/api/auth/google/login" className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                            <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 72.2C322 106.5 287.7 96 248 96c-88.8 0-160 71.3-160 160s71.2 160 160 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Sign in with Google
                        </Button>
                    </a>
                </div>

                <div className="flex justify-around pt-6 text-muted-foreground">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mb-2">
                            <Scroll size={20} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium">Track Quests</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mb-2">
                            <Shield size={20} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium">Earn Rewards</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
