import React, { useState, useEffect, ReactNode } from "react";
import { 
  ClipboardCheck, 
  ShieldCheck, 
  Award, 
  PieChart, 
  ArrowUp 
} from "lucide-react";
import axios from "axios";
import { getCookie } from "cookies-next";

// API Base URL
const API_BASE = "https://backend-iso27001.onrender.com/api";

// Definir interfaces para los tipos de datos
interface Auditoria {
  id: number;
  state?: string;
  documentId?: string;
  // Añade otras propiedades según tu API
}

interface Controlador {
  id: number;
  // Añade otras propiedades según tu API
}

// Interfaz para la respuesta de la API (basada en tu estructura)
interface ApiResponse<T> {
  data: T[];
  meta?: any;
}

// Tipos para props del KpiCard
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber' | string;
  increase?: number | null;
  subtitle?: string;
  isLoading?: boolean;
}

// Componente KpiCard
const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  color,
  increase,
  subtitle,
  isLoading = false,
}) => {
  const [animate, setAnimate] = useState<boolean>(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const getGradient = (): string => {
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

  if (isLoading) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-70`}></div>
        <div className="relative p-6 text-white animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-4 bg-white bg-opacity-30 rounded w-24 mb-2"></div>
              <div className="h-8 bg-white bg-opacity-30 rounded w-16"></div>
            </div>
            <div className="p-3 rounded-lg bg-white bg-opacity-25 h-12 w-12"></div>
          </div>
          <div className="h-4 bg-white bg-opacity-30 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
        animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
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

     
      </div>
    </div>
  );
};

// Componente principal
const IsoKpiCards: React.FC = () => {
  // Estados con tipos explícitos
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [controladores, setControladores] = useState<Controlador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [crecimientoAuditorias, setCrecimientoAuditorias] = useState<number>(8);
  const [nivelCumplimiento, setNivelCumplimiento] = useState<number>(78);

  // Función auxiliar para obtener token
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = getCookie('auth_token');
    return typeof token === 'string' ? token : null;
  };

  // Cargar datos reales
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      
      try {
        const token = getAuthToken();
        
        // Objeto para almacenar múltiples promesas
        const apiPromises: Promise<any>[] = [];
        
        // Configuración de Axios con token
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        // Cargar auditorías
        apiPromises.push(
          axios.get(`${API_BASE}/auditorias`, config)
            .then(response => {
              console.log('Datos de auditorías recibidos:', response.data);
              // Verificar la estructura real de la respuesta para adaptar
              if (response.data && Array.isArray(response.data.data)) {
                setAuditorias(response.data.data);
                return response.data.data;
              } else if (Array.isArray(response.data)) {
                setAuditorias(response.data);
                return response.data;
              } else {
                console.warn('Formato de respuesta de auditorías inesperado:', response.data);
                return [];
              }
            })
            .catch(err => {
              console.error('Error cargando auditorías:', err);
              return [];
            })
        );
        
        // Cargar controladores (con endpoint corregido)
        apiPromises.push(
          axios.get(`${API_BASE}/controladors?pagination[pageSize]=93`, config)
            .then(response => {
              console.log('Datos de controladores recibidos:', response.data);
              // Verificar la estructura real de la respuesta para adaptar
              if (response.data && Array.isArray(response.data.data)) {
                setControladores(response.data.data);
                return response.data.data;
              } else if (Array.isArray(response.data)) {
                setControladores(response.data);
                return response.data;
              } else {
                console.warn('Formato de respuesta de controladores inesperado:', response.data);
                return [];
              }
            })
            .catch(err => {
              console.error('Error cargando controladores:', err);
              return [];
            })
        );
        
        // Esperar que todas las promesas se resuelvan
        const [auditoriasData, controladoresData] = await Promise.all(apiPromises);
        
        // Calcular nivel de cumplimiento
        try {
          if (Array.isArray(auditoriasData) && auditoriasData.length > 0) {
            const completadas = auditoriasData.filter((a: any) => 
              a.state === 'Completada' || a.attributes?.state === 'Completada'
            ).length;
            const total = auditoriasData.length || 1;
            const porcentaje = Math.round((completadas / total) * 100);
            setNivelCumplimiento(porcentaje || 78);
          }
        } catch (err) {
          console.error('Error calculando nivel de cumplimiento:', err);
        }
        
      } catch (err: unknown) {
        console.error('Error general en la carga de datos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Actualizar datos cada 5 minutos
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="AUDITORÍAS DISPONIBLES"
        value={loading ? "..." : auditorias.length}
        icon={<ClipboardCheck className="h-6 w-6 text-white" />}
        color="blue"
        increase={crecimientoAuditorias}
        subtitle="TOTAL"
        isLoading={loading}
      />

      <KpiCard
        title="CONTROLES ISO"
        value={loading ? "..." : controladores.length}
        icon={<ShieldCheck className="h-6 w-6 text-white" />}
        color="green"
        increase={0}
        subtitle="DISPONIBLES"
        isLoading={loading}
      />

      <KpiCard
        title="EVALUANDO PARA"
        value="ISO 27001"
        icon={<Award className="h-6 w-6 text-white" />}
        color="purple"
        increase={null}
        subtitle="ESTÁNDAR INTERNACIONAL"
        isLoading={loading}
      />

      <KpiCard
        title="NIVEL DE CUMPLIMIENTO"
        value={loading ? "..." : `${nivelCumplimiento}%`}
        icon={<PieChart className="h-6 w-6 text-white" />}
        color="amber"
        increase={12.5}
        subtitle="PROMEDIO CLIENTES"
        isLoading={loading}
      />
    </div>
  );
};

export default IsoKpiCards;