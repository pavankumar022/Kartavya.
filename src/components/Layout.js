import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  PlusCircle, 
  FileText, 
  User, 
  LogOut,
  Search,
  Trophy,
  Shield
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Community Feed', path: '/feed' },
    { icon: PlusCircle, label: 'Report Issue', path: '/report' },
    { icon: FileText, label: 'My Reports', path: '/my-reports' },
    { icon: Shield, label: 'Gov Authorities', path: '/authorities' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Kartavya Logo" 
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/30 shadow-lg"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-white rounded-xl items-center justify-center hidden shadow-lg">
                <span className="text-blue-600 font-bold text-2xl">K</span>
              </div>
              <h1 className="text-2xl font-bold drop-shadow-lg">Kartavya</h1>
            </div>
            <span className="text-blue-100 text-sm">Be the Change Bharat Needs – Kartavya Se Shuru Karo.</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search issues by location, category..."
                className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30 w-80"
              />
            </div>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-8">
              {localStorage.getItem('profileImage') ? (
                <img
                  src={localStorage.getItem('profileImage')}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user.name?.[0] || 'U'}</span>
                </div>
              )}
              <div>
                <p className="font-medium">{user.name || 'User'}</p>
                <p className="text-gray-400 text-sm">Resident</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;