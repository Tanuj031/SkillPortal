import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const userName = user?.name || user?.fullName || 'Rahul Sharma';
  const userRole = user?.designation || 'Director';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/assessment', label: 'Assessment' },
    { to: '/dashboard/skill-gaps', label: 'Skill Gaps' },
    { to: '/dashboard/recommendations', label: 'Recommendations' },
  ];

  return (
    <header className="sticky top-2 z-30 mx-3 my-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl md:rounded-full shadow-md px-4 md:px-6 h-16 flex items-center justify-between transition-all">
      {/* Left: iGOT Brand & Officer Role */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0F2E5C] text-white flex items-center justify-center font-bold text-sm border-2 border-[#F5A623] shadow-xs flex-shrink-0">
          {userName.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#0F2E5C] text-base md:text-lg leading-none tracking-tight">
              SkillPortal
            </span>
            <span className="bg-[#F5A623]/15 text-[#D98E18] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
              iGOT MoSPI
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 leading-tight mt-0.5">
            {userRole}
          </span>
        </div>
      </div>

      {/* Center: Desktop Plain Text Navigation Links with Saffron Active Underline */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `py-2 transition-all border-b-2 ${
                isActive
                  ? 'border-[#F5A623] text-[#0F2E5C] font-bold'
                  : 'border-transparent text-slate-600 hover:text-[#0F2E5C] hover:border-slate-300'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Right: Outlined Help/Logout Buttons on Desktop & Mobile Hamburger Toggle */}
      <div className="flex items-center gap-2">
        {/* Desktop-only Outlined Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => alert('MoSPI SkillPortal Support: support@mospi.gov.in')}
            className="min-h-[38px] px-3.5 py-1.5 border border-[#0F2E5C]/30 text-[#0F2E5C] hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">help_outline</span>
            <span>Help</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="min-h-[38px] px-4 py-1.5 border border-[#0F2E5C] text-[#0F2E5C] hover:bg-[#0F2E5C] hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button (3 horizontal lines) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#0F2E5C] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle Navigation Drawer"
        >
          <span className="material-symbols-outlined text-2xl font-bold">menu</span>
        </button>
      </div>
    </header>
  );
}
