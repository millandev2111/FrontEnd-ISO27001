'use client';
import React from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import { ResultadosProvider } from '@/context/ResultadosContext';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ResultadosProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <div className="w-64 bg-blue-300 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ResultadosProvider>
  );
};

export default DashboardLayout;
