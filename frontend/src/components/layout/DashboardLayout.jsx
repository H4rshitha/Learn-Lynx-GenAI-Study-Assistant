import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

export const DashboardLayout = ({ children, title, subtitle }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col lg:flex-row text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
};
