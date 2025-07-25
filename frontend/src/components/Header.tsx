import React, { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Settings, LogOut, Menu as MenuIcon, X, Scroll } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, setTheme, isSystem, setIsSystem } = useTheme();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-gradient-to-r from-primary/20 to-primary/10 border-b-2 border-border shadow-lg relative">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center text-foreground hover:text-primary font-bold text-xl">
                        <Scroll className="text-primary mr-2 h-8 w-8" />
                        <span>Quest Board</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-4">
                        <Link to="/quests" className="text-foreground hover:text-primary font-medium transition-colors">
                            Quests
                        </Link>
                        <Link to="/dashboard" className="text-foreground hover:text-primary font-medium transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/store" className="text-foreground hover:text-primary font-medium transition-colors">
                            Store
                        </Link>
                        {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                            <Link to="/admin" className="text-foreground hover:text-primary font-medium transition-colors">
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* User Menu Row: Notification Bell and User Menu */}
                    <div className="flex items-center">
                        <NotificationBell />
                        {user && (
                            <Menu as="div" className="ml-3 relative">
                                <Menu.Button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary-foreground">
                                            {(user.name || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden md:block text-sm font-medium">{user.name || 'User'}</span>
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/profile"
                                                        className={`${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                                                            } flex items-center px-4 py-2 text-sm`}
                                                    >
                                                        <Settings className="mr-3 h-4 w-4" />
                                                        Character Sheet
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <div className="px-4 py-2 text-sm text-muted-foreground">Theme</div>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => { setIsSystem(false); setTheme('light'); }}
                                                        className={`${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                                                            } flex w-full items-center px-4 py-2 text-sm`}
                                                    >
                                                        <Sun className="mr-2 h-4 w-4" />
                                                        <span>Light</span>
                                                        {(!isSystem && theme === 'light') && <span className="ml-auto">✓</span>}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => { setIsSystem(false); setTheme('dark'); }}
                                                        className={`${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                                                            } flex w-full items-center px-4 py-2 text-sm`}
                                                    >
                                                        <Moon className="mr-2 h-4 w-4" />
                                                        <span>Dark</span>
                                                        {(!isSystem && theme === 'dark') && <span className="ml-auto">✓</span>}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setIsSystem(true)}
                                                        className={`${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                                                            } flex w-full items-center px-4 py-2 text-sm`}
                                                    >
                                                        <Monitor className="mr-2 h-4 w-4" />
                                                        <span>System</span>
                                                        {isSystem && <span className="ml-auto">✓</span>}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                                                            } flex w-full items-center px-4 py-2 text-sm`}
                                                    >
                                                        <LogOut className="mr-3 h-4 w-4" />
                                                        Sign Out
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex md:hidden ml-3 p-2 rounded-lg text-foreground hover:text-primary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <MenuIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 z-50">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border shadow-lg">
                            <Link
                                to="/quests"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-foreground hover:text-primary px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-muted border border-transparent hover:border-border flex items-center gap-2"
                            >
                                Quests
                            </Link>
                            <Link
                                to="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-foreground hover:text-primary px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-muted border border-transparent hover:border-border flex items-center gap-2"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/store"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-foreground hover:text-primary px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-muted border border-transparent hover:border-border flex items-center gap-2"
                            >
                                Store
                            </Link>
                            <Link
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-foreground hover:text-primary px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-muted border border-transparent hover:border-border flex items-center gap-2"
                            >
                                Character
                            </Link>
                            {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-foreground hover:text-primary px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-muted border border-transparent hover:border-border flex items-center gap-2"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
