import api, { FILE_BASE_URL } from '../utils/api';
import { User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="top-header">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-secondary hover:text-primary transition-colors mobile-menu-btn"
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
                <h2 className="header-title hidden md:block">Shupavu Management System</h2>
            </div>
            <div className="flex items-center gap-6">
                <button className="text-secondary hover:text-accent transition-colors">
                    <Bell size={22} />
                </button>
                <div className="user-profile">
                    <div className="avatar w-8 h-8 rounded-full overflow-hidden border border-border bg-gray-50 flex items-center justify-center">
                        {user?.photo ? (
                            <img src={user.photo.startsWith('http') ? user.photo : `${FILE_BASE_URL}${user.photo}`} className="w-full h-full object-cover" alt="" />
                        ) : <User size={16} className="text-secondary" />}
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
