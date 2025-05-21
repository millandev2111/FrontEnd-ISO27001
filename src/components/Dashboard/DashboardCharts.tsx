import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions, // Añadir esta importación
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import toast from 'react-hot-toast';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Definición de tipos
interface Auditoria {
  id: number;
  documentId: string;
  title: string;
  state: string;
  progreso: number;
  controladors?: any[];
  resultados?: any[];
}

interface TooltipContext {
  raw: number;
  dataIndex: number;
  dataset: any;
  label: string;
}

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = getCookie('auth_token');
  return typeof token === 'string' ? token : null;
};

// Componente de gráfico de barras para progreso de auditorías
export const AuditCompletionChart = () => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditorias = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const timestamp = new Date().getTime();
        const response = await axios.get('https://backend-iso27001.onrender.com/api/auditorias', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            populate: ['resultados', 'controladors'],
            _t: timestamp,
          },
        });

        if (!response.data || !response.data.data) {
          throw new Error('Formato de respuesta inesperado');
        }

        // Procesar las auditorías para calcular el progreso
        const auditoriasData: Auditoria[] = response.data.data.map((audit: any) => {
          const controles = audit.controladors?.length || 0;
          const resultados = audit.resultados?.length || 0;
          const progreso = controles > 0 ? Math.round((resultados / controles) * 100) : 0;
          
          return {
            id: audit.id,
            documentId: audit.documentId,
            title: audit.title,
            state: audit.state,
            progreso: progreso,
            controladors: audit.controladors,
            resultados: audit.resultados
          };
        });

        setAuditorias(auditoriasData);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error al cargar auditorías:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar auditorías');
        setLoading(false);
        toast.error('No se pudieron cargar las auditorías');
      }
    };

    fetchAuditorias();
  }, []);

  // Generar colores según el progreso
  const getColorByProgress = (progress: number): string => {
    if (progress >= 90) return 'rgba(34, 197, 94, 0.8)'; // Verde para casi completo
    if (progress >= 60) return 'rgba(99, 102, 241, 0.8)'; // Azul para buen progreso
    if (progress >= 30) return 'rgba(249, 115, 22, 0.8)'; // Naranja para progreso medio
    return 'rgba(239, 68, 68, 0.8)'; // Rojo para poco progreso
  };

  // Usar una aserción de tipo para las opciones
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `Progreso: ${context.raw}%`;
          },
          title: function(context: any[]) {
            return context[0].label;
          },
          afterLabel: function(context: any) {
            const index = context.dataIndex;
            if (index >= 0 && index < auditorias.length) {
              return `Estado: ${auditorias[index].state}`;
            }
            return 'Estado: No definido';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          borderDash: [2, 4],
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          callback: function(value: number) {
            return value + '%';
          }
        }
      }
    }
  } as ChartOptions<'bar'>;  // Usar aserción de tipo aquí
  
  // Preparar datos para el gráfico
  const chartData = {
    labels: auditorias.map((audit: Auditoria) => audit.title),
    datasets: [
      {
        data: auditorias.map((audit: Auditoria) => audit.progreso),
        backgroundColor: auditorias.map((audit: Auditoria) => getColorByProgress(audit.progreso)),
        borderRadius: 4,
        borderWidth: 0,
        barThickness: 16
      }
    ]
  };
  
  if (loading) {
    return <div className="h-60 flex items-center justify-center">Cargando auditorías...</div>;
  }

  if (error) {
    return (
      <div className="h-60 flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (auditorias.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-gray-500">
        No hay auditorías disponibles.
      </div>
    );
  }
  
  return (
    <div className="h-60">
      <Bar options={options} data={chartData} />
    </div>
  );
};

// Componente para mostrar el progreso de las auditorías
export const AuditProgressPanel = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Progreso de Auditorías</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">Ver detalles</button>
      </div>
      
      <AuditCompletionChart />
    </div>
  );
};