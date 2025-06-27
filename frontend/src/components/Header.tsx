import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Scroll, Shield, Crown, Settings, LogOut, Coins, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
    const { user, logout, isEditorOrAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getRoleTitle = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Guild Master';
            case 'EDITOR':
                return 'Quest Giver';
            case 'PLAYER':
                return 'Adventurer';
            default:
                return role;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Crown className="h-4 w-4 text-amber-600" />;
            case 'EDITOR':
                return <Scroll className="h-4 w-4 text-amber-600" />;
            case 'PLAYER':
                return <Shield className="h-4 w-4 text-amber-600" />;
            default:
                return <Shield className="h-4 w-4 text-amber-600" />;
        }
    };

    return (
        <header className="border-b-4 border-amber-300 bg-linear-to-r from-amber-200 to-yellow-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Navigation */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center group">
                            <div className="shrink-0">
                                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                                    <Scroll className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <span className="ml-3 text-2xl font-bold text-amber-900 font-serif group-hover:text-amber-800 transition-colors">
                                Quest Board
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="ml-10 flex space-x-6">
                            <Link
                                to="/dashboard"
                                className="text-amber-700 hover:text-amber-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-amber-100 border border-transparent hover:border-amber-300"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/quests"
                                className="text-amber-700 hover:text-amber-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-amber-100 border border-transparent hover:border-amber-300"
                            >
                                Quest Board
                            </Link>
                            <Link
                                to="/store"
                                className="text-amber-700 hover:text-amber-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-amber-100 border border-transparent hover:border-amber-300 flex items-center gap-1"
                            >
                                <Store className="w-4 h-4" />
                                Guild Store
                            </Link>
                            {isEditorOrAdmin && (
                                <Link
                                    to="/admin"
                                    className="text-amber-700 hover:text-amber-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-amber-100 border border-transparent hover:border-amber-300 flex items-center gap-1"
                                >
                                    <Crown className="w-4 h-4" />
                                    Guild Hall
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center">
                        {user && (
                            <Menu as="div" className="ml-3 relative">
                                <div>
                                    <Menu.Button className="flex items-center bg-white border-2 border-amber-300 rounded-lg px-3 py-2 hover:bg-amber-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all duration-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <div className="text-amber-900 font-medium text-sm">
                                                    {user.characterName || user.name}
                                                </div>
                                                <div className="text-amber-700 text-xs flex items-center gap-1">
                                                    {getRoleIcon(user.role)}
                                                    {getRoleTitle(user.role)}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center overflow-hidden">
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white font-bold text-sm">
                                                        {(user.characterName || user.name).split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Menu.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 bg-linear-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 focus:outline-hidden z-50">
                                        <Menu.Item>
                                            {() => (
                                                <div className="px-4 py-3 border-b border-amber-200">
                                                    <div className="font-medium text-amber-900 font-serif">
                                                        {user.characterName || user.name}
                                                    </div>
                                                    <div className="text-amber-700 text-sm">{user.email}</div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex items-center text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded border border-amber-300">
                                                            {getRoleIcon(user.role)}
                                                            <span className="ml-1">{getRoleTitle(user.role)}</span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded border border-amber-300">
                                                            <Coins className="w-3 h-3 mr-1" />
                                                            {user.bountyBalance || 0} gold
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/profile"
                                                    className={`${active ? 'bg-amber-100' : ''
                                                        } flex items-center px-4 py-2 text-sm text-amber-900 hover:bg-amber-100 transition-colors`}
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
                                                    className={`${active ? 'bg-amber-100' : ''
                                                        } flex items-center w-full px-4 py-2 text-sm text-amber-900 hover:bg-amber-100 transition-colors`}
                                                >
                                                    <LogOut className="mr-3 h-4 w-4" />
                                                    Leave Guild
                                                </button>
                                            )}
                                        </Menu.Item>
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
