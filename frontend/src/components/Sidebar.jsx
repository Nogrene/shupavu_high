import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Fees', icon: CreditCard, path: '/fees' },
        { name: 'Settings', icon: Settings, path: '/settings', adminOnly: true },
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header justify-between">
                <div className="sidebar-brand">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <span>Shupavu High</span>
                </div>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="md:hidden text-slate-400 hover:text-white p-1"
                    aria-label="Close sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    (!item.adminOnly || user?.role === 'Admin') && (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => {
                                // Close sidebar on mobile when a link is clicked
                                if (window.innerWidth < 768) {
                                    onClose();
                                }
                            }}
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
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-accent bg-accent/10 py-2 rounded-lg border border-accent/20">
                        A creation of <span className="text-white">Nogrene</span>
                    </p>
                    <p className="text-[9px] text-slate-500 mt-2">&copy; {new Date().getFullYear()} Shupavu High</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
