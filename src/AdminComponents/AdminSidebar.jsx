import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShieldAlert, FileText, 
  Star, BarChart3, Settings, LogOut, BookOpen, Crown, X, User as UserIcon
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, onClick }) => (
  <NavLink 
    to={path}
    onClick={onClick} 
    end={path === '/admin'} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg transition-all duration-200
      ${isActive 
        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    {({ isActive }) => (
      <>
        <Icon 
          size={18} 
          className={isActive ? 'text-blue-600' : 'text-gray-400'} 
        />
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar = ({ isOpen, onClose, adminUser, onLogout }) => {
  return (
    <aside className={`
      /* Layout & Sizing */
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden
      /* Animation & Responsibility */
      transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 
      ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}>
      
      {/* Brand Logo Section */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-100">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-gray-900 leading-none">TOONLORD</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Management</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto mt-4 px-2 custom-scrollbar">
        <div className="px-6 mb-2 text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black">Overview</div>
    <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/admin" onClick={onClose} />

        <div className="px-6 mt-6 mb-2 text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black">Management</div>
         <SidebarItem icon={Users} label="Users" path="/admin/users" onClick={onClose} />

        <SidebarItem icon={BookOpen} label="Manga Series" path="/admin/manga" onClick={onClose} />

        <SidebarItem icon={Star} label="Premium Request" path="/admin/request" onClick={onClose} />

        <SidebarItem icon={ShieldAlert} label="Reports" path="/admin/reports" onClick={onClose} />

        <SidebarItem icon={FileText} label="Contracts" path="/admin/contracts" onClick={onClose} />



        <div className="px-6 mt-6 mb-1 text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black">System</div>
        <SidebarItem icon={Settings} label="Settings" path="/admin/settings" onClick={onClose} />
      </nav>

      {/* Profile & Logout Section - UPDATED */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              {adminUser?.profilePicture ? (
                <img 
                  src={adminUser.profilePicture} 
                  alt="Admin Profile" 
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                  <UserIcon size={16} className="text-blue-600" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate max-w-[100px]">
                {adminUser?.username || 'Admin'}
              </p>
              <p className="text-[10px] text-gray-400 font-medium leading-none">Super Admin</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg group"
            title="Logout"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;