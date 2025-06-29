import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Crown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ui/theme-toggle';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-gradient-to-r from-primary/20 to-primary/10 border-b-2 border-border shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <Crown className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground font-serif">Quest Board</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/quests"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            Quests
                        </Link>
                        <Link
                            to="/dashboard"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/store"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            Store
                        </Link>
                        <Link
                            to="/profile"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            Character
                        </Link>
                        {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                            <Link
                                to="/admin"
                                className="text-foreground hover:text-primary font-medium transition-colors"
                            >
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {user && (
                            <Menu as="div" className="ml-3 relative">
                                <Menu.Button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary-foreground">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden md:block text-sm font-medium">{user.name}</span>
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
                                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-card border border-border rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                        <div className="py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/profile"
                                                        className={`${
                                                            active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                                                        } flex items-center px-4 py-2 text-sm`}
                                                    >
                                                        <Settings className="mr-3 h-4 w-4" />
                                                        Character Sheet
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${
                                                            active ? 'bg-muted text-foreground' : 'text-muted-foreground'
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
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
