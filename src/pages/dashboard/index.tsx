// pages/dashboard/index.tsx
import React, { ReactNode, useState, useEffect, } from "react";
import { useRouter } from "next/router";
import {
  Activity,
  DollarSign,
  Package,
  Users,
  Clock,
  Calendar,
  Plus,
  Search,
  Bell,
  Filter,
  ArrowUp,
  CheckCircle
} from "lucide-react";
import AuditoriaWidget from "@/components/Dashboard/AuditoriaWidget";
import DashboardLayout from "./layout";
import { PerformanceLineChart, AuditProgressPanel, AnalyticsPanel } from "@/components/Dashboard/DashboardCharts";
import { NotificationsPanel, DailySummary } from "@/components/Dashboard/DashboardWidgets";
import IsoKpiCards from "@/components/Dashboard/KpiCards";

// Tipos para props del KpiCard
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber' | string;
  increase?: number;
  subtitle?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  color,
  increase,
  subtitle,
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const getGradient = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-indigo-600';
      case 'green':
        return 'from-emerald-500 to-green-600';
      case 'purple':
        return 'from-purple-500 to-indigo-600';
      case 'amber':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      style={{ transitionDelay: '100ms' }}
    >
      {/* Fondo con gradiente */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-90`}></div>

      {/* Decoración */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white opacity-10"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-36 h-36 rounded-full bg-white opacity-10"></div>

      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
            {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-lg bg-white bg-opacity-25">
            {icon}
          </div>
        </div>

        {increase !== undefined && (
          <div className="flex items-center text-sm">
            <span className={`flex items-center font-medium ${increase >= 0 ? 'text-green-100' : 'text-red-100'}`}>
              {increase >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : null}
              {increase >= 0 ? "+" : ""}{increase}%
            </span>
            <span className="opacity-70 ml-2">vs. semana anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardModerno() {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'todas' | 'en progreso' | 'completadas'>('todas');

  const router = useRouter();

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500">Cargando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header con búsqueda */}
          <header className="pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-800">Tu actividad</h1>
            </div>

            
          </header>

          {/* KPI Cards - Diseño premium con gradientes y animación */}
         <IsoKpiCards />

        

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-20">
            {/* Panel principal (izquierda) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sección de auditorías */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                      Auditorías
                    </h2>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/auditoria')}
                      className="py-2 px-4 bg-white text-blue-600 rounded-lg shadow hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Nueva</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* AuditoriaWidget existente */}
                  <AuditoriaWidget />
                </div>
              </div>

              {/* Gráfico analítico */}
              <AnalyticsPanel />
            </div>

            {/* Panel lateral (derecha) */}
            <div className="space-y-6">
              <DailySummary />
              <NotificationsPanel />
            </div>
          </div>

          {/* Sección inferior */}
          <div className="mb-8">
            <AuditProgressPanel />
          </div>

          {/* Pie de página */}
          <footer className="py-6 text-center text-sm text-gray-500">
            <p>© 2023 Sistema de Control ISO 27001. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}
