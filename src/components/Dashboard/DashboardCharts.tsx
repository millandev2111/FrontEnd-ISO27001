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