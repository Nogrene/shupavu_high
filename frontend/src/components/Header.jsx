import React from 'react';
import { User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user } = useAuth();

    return (
        <header className="top-header">
            <div className="flex items-center gap-4">
                <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
                <h2 className="header-title">Shupavu Management System</h2>
            </div>
            <div className="flex items-center gap-6">
                <button className="text-secondary hover:text-accent transition-colors">
                    <Bell size={22} />
                </button>
                <div className="user-profile">
                    <div className="avatar">
                        <User size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">{user?.role}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
