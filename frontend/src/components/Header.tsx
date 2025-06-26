import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
    const { user, logout, isEditorOrAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Navigation */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-8 w-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <span className="ml-2 text-xl font-bold text-gray-900">Quest Board</span>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="ml-10 flex space-x-8">
                            <Link
                                to="/dashboard"
                                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/quests"
                                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Quests
                            </Link>
                            {isEditorOrAdmin && (
                                <Link
                                    to="/admin"
                                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center">
                        {user && (
                            <Menu as="div" className="ml-3 relative">
                                <div>
                                    <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-700 font-medium">{user.name}</span>
                                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
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
                                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                        <Menu.Item>
                                            {() => (
                                                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-gray-500">{user.email}</div>
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        {user.role} • Bounty: {user.bountyBalance || 0}
                                                    </div>
                                                </div>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/profile"
                                                    className={`${active ? 'bg-gray-100' : ''
                                                        } flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                                                >
                                                    <CogIcon className="mr-3 h-4 w-4" />
                                                    Profile Settings
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-gray-100' : ''
                                                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                                                >
                                                    <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                                    Sign out
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
