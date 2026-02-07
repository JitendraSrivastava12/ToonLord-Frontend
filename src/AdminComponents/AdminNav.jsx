import React, { useState } from 'react';
import { Search, Bell, Settings, HelpCircle, ChevronDown, Menu, LogOut, User as UserIcon } from 'lucide-react';

const TopNav = ({ onMenuClick, adminUser, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
      
      {/* 1. Left Section: Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full max-w-[40px] md:max-w-96 group transition-all duration-300 md:focus-within:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </span>
          <input
            type="text"
            placeholder="Search users or reports..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm
                       md:placeholder:block placeholder:invisible focus:placeholder:visible md:w-full"
          />
        </div>
      </div>

      {/* 2. Actions & Profile (Right) */}
      <div className="flex items-center gap-1 md:gap-2">
        <button className="hidden sm:flex p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Help">
          <HelpCircle size={20} />
        </button>

        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative" title="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
        </button>

        <div className="hidden md:block h-6 w-[1px] bg-gray-200 mx-3"></div>

        {/* Admin Quick Profile & Dropdown */}
        <div className="relative">
          <div 
            className="flex items-center gap-2 md:gap-3 pl-2 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {adminUser?.username || 'Admin'}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                Super Admin
              </p>
            </div>
            
            <div className="relative">
              {adminUser?.profilePicture ? (
                <img 
                  src={adminUser.profilePicture} 
                  alt="Admin" 
                  className="w-9 h-9 rounded-full border border-gray-200 group-hover:border-blue-500 transition-all object-cover"
                />
              ) : (
                <div className="bg-gray-100 p-2 rounded-full border border-gray-200 group-hover:bg-blue-50 transition-all">
                  <Settings size={18} className="text-gray-600 group-hover:text-blue-600" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <ChevronDown size={14} className={`hidden xs:block text-gray-400 group-hover:text-gray-900 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                  <p className="text-sm font-bold truncate text-gray-800">{adminUser?.email}</p>
                </div>
                
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  <UserIcon size={16} /> Profile Settings
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  <Settings size={16} /> System Logs
                </button>
                
                <div className="h-px bg-gray-100 my-1"></div>
                
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;