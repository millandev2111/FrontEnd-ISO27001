// pages/dashboard/layout.tsx
import React from 'react'
import Sidebar from '@/components/Dashboard/Sidebar'  // Asumimos que tienes un componente Sidebar
import { ReactNode } from 'react'
import Header from '@/components/Dashboard/Header'

interface DashboardLayoutProps {
    children: ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar siempre visible */}
            <div className="w-64 bg-blue-300 flex-shrink-0">
                <Sidebar />
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header siempre visible, ocupa todo el ancho */}
                <Header />

                {/* Área de contenido */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout