import { useState, useEffect } from 'react';
import { Home, FileText, BookOpen, ClipboardCheck, LifeBuoy } from 'lucide-react';

export default function Sidebar() {
    const [activeItem, setActiveItem] = useState('dashboard');

    // Detectar la URL actual para establecer el elemento activo
    useEffect(() => {
        const path = window.location.pathname;
        
        if (path === '/dashboard') {
            setActiveItem('dashboard');
        } else if (path.includes('/dashboard/auditoria')) {
            setActiveItem('auditoria');
        } else if (path.includes('/dashboard/modulos-capacitacion')) {
            setActiveItem('capacitacion');
        } else if (path.includes('/dashboard/evaluaciones')) {
            setActiveItem('evaluaciones');
        } else if (path.includes('/dashboard/soporte')) {
            setActiveItem('soporte');
        }
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Inicio', icon: <Home size={20} />, href: '/dashboard' },
        { id: 'auditoria', label: 'Auditorías', icon: <FileText size={20} />, href: '/dashboard/auditoria' },
        { id: 'capacitacion', label: 'Módulos de Capacitación', icon: <BookOpen size={20} />, href: '/dashboard/modulos-capacitacion' },
        { id: 'evaluaciones', label: 'Resultados', icon: <ClipboardCheck size={20} />, href: '/dashboard/evaluaciones' },
        { id: 'soporte', label: 'Soporte', icon: <LifeBuoy size={20} />, href: '/dashboard/soporte' },
    ];

    return (
        <div className="h-screen bg-blue-500 text-white w-64 flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-center h-20 p-4 border-b border-blue-400">
                <div className="flex items-center">
                    <span className="text-xl font-semibold">Dashboard</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 pt-4 overflow-y-auto">
                <ul className="px-2">
                    {menuItems.map((item) => (
                        <li key={item.id} className="mb-2">
                            <a 
                                href={item.href}
                                onClick={() => setActiveItem(item.id)}
                                className={`flex items-center rounded-lg px-3 py-3 transition-all duration-200
                                    ${activeItem === item.id
                                        ? 'bg-blue-400 text-white' 
                                        : 'text-white hover:bg-blue-400 hover:text-white'
                                    }`}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                <span className="ml-3">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>


        </div>
    );
}