import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Fees', icon: CreditCard, path: '/fees' },
        { name: 'Settings', icon: Settings, path: '/settings', adminOnly: true },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <span>Shupavu High</span>
                </div>
                {/* <p className="text-xs font-normal text-slate-400 mt-1 italic">"Usiwe Mjinga"</p> */}
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    (!item.adminOnly || user?.role === 'Admin') && (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    )
                ))}
            </nav>
            <div className="sidebar-footer">
                <button onClick={logout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full p-2 rounded-md hover:bg-white/5">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
