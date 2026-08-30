import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
