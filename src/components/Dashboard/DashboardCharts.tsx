import React from 'react';
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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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

// Componente de gráfico de línea más avanzado y estético
export const PerformanceLineChart = () => {
  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle'
        }
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
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        grid: {
          borderDash: [2, 4],
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          stepSize: 20
        }
      }
    },
    elements: {
      line: {
        tension: 0.3 // Hace que la línea sea más suave
      },
      point: {
        radius: 3,
        hoverRadius: 6
      }
    }
  };
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Auditorías completadas',
        data: [30, 42, 38, 45, 63, 58, 70, 75, 80],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        fill: false,
      },
      {
        label: 'Tiempo promedio (min)',
        data: [45, 40, 35, 30, 32, 25, 28, 22, 20],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        fill: false,
      }
    ],
  };
  
  return (
    <div className="h-80">
      <Line options={options} data={data} />
    </div>
  );
};

// Componente de gráfico de barras para progreso de auditorías
export const AuditCompletionChart = () => {
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
        cornerRadius: 8
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
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };
  
  const data = {
    labels: ['ISO 27001', 'PRUEBA100', 'hola', 'Control Calidad', 'Auditoría Trimestral'],
    datasets: [
      {
        data: [85, 100, 100, 45, 70],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderRadius: 4,
        borderWidth: 0,
        barThickness: 16
      }
    ]
  };
  
  return (
    <div className="h-60">
      <Bar options={options} data={data} />
    </div>
  );
};

// Para usarse en el dashboard
export const AnalyticsPanel = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Analíticas</h3>
        <select className="text-sm border rounded-md py-1 px-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>Este mes</option>
          <option>Último trimestre</option>
          <option>Este año</option>
        </select>
      </div>
      
      <PerformanceLineChart />
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