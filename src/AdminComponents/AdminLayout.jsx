import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './AdminSidebar';
import TopNav from './AdminNav';

/**
 * AdminLayout - The master wrapper for all protected admin routes.
 * Handles authentication checks, mobile navigation, and layout structure.
 */
const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. AUTHENTICATION SHIELD ---
  // Retrieve credentials from localStorage
  const token = localStorage.getItem('adminToken');
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));

  // If no token exists or the user is not an admin, block access and redirect
  if (!token || adminUser?.role !== 'admin') {
    return <Navigate to="/adminlogin" state={{ from: location }} replace />;
  }

  // --- 2. HANDLERS ---
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    // Clear all administrative session data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/adminlogin');
  };

  // Close mobile menu automatically when the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 overflow-hidden font-sans">
      
      {/* 3. SIDEBAR NAVIGATION */}
      {/* Pass adminUser to display name/avatar and onLogout for the bottom exit button */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 4. TOP NAVIGATION BAR */}
        {/* Pass user info for the profile dropdown and menu toggle for mobile */}
        <TopNav 
          onMenuClick={toggleMobileMenu} 
          adminUser={adminUser}
          onLogout={handleLogout}
        />

        {/* 5. DYNAMIC CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] relative scroll-smooth">
          {/* The Container: Centers content and provides consistent padding.
            Outlet: Renders the child components (UserManagement, Reports, etc.)
          */}
          <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-full">
            <Outlet context={{ adminUser }} />
          </div>
        </main>

        {/* 6. MOBILE OVERLAY */}
        {/* Appears when the sidebar is open on mobile to dim the content */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default AdminLayout;