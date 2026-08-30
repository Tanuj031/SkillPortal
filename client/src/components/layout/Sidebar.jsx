import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const mainNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/dashboard/profile', label: 'Profile', icon: 'person' },
    { to: '/dashboard/assessment', label: 'Assessment', icon: 'fact_check' },
    { to: '/dashboard/skill-gaps', label: 'Skill Gaps', icon: 'trending_down' },
    { to: '/dashboard/recommendations', label: 'Recommendations', icon: 'lightbulb' },
    { to: '/dashboard/quiz', label: 'Quiz', icon: 'quiz' },
    { to: '/dashboard/admin', label: 'Admin Oversight', icon: 'admin_panel_settings' },
  ];

  const secondaryNavItems = [
    { to: '/dashboard/certification', label: 'View Certification', icon: 'workspace_premium' },
    { to: '/dashboard/settings', label: 'Settings', icon: 'settings' },
    { to: '/dashboard/support', label: 'Support', icon: 'help' },
  ];

  return (
    <>
      {/* Semi-transparent Backdrop Overlay for Mobile Drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-10 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Navigation Header */}
          <div className="h-16 px-6 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">grid_view</span>
              <span className="font-bold text-primary text-base">Navigation</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
              aria-label="Close Navigation Menu"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'text-slate-700 hover:bg-surface-container-low hover:text-primary'
                  }`
                }
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Secondary Actions & Support Links */}
          <div className="px-4 py-2 border-t border-outline-variant/60 space-y-1.5">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `min-h-[44px] px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-bright'
                  }`
                }
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-outline-variant text-[11px] text-on-surface-variant bg-surface-bright">
          <p className="font-bold text-primary">MoSPI Skill Platform</p>
          <p className="mt-0.5">Government of India • FY2025-26</p>
        </div>
      </aside>
    </>
  );
}
