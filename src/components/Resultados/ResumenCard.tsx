// @/components/Resultados/ResumenCard.tsx
import React from 'react';
import { CheckCircle, AlertCircle, HelpCircle, Clock, XCircle } from 'lucide-react';

interface ResumenProps {
  totalControles: number;
  evaluados: number;
  pendientes: number;
  cumplidos: number;
  parciales: number;
  noCumplidos: number;
  noAplica: number;
  porcentajeCumplimiento: number;
  porcentajeCompletitud: number;
  onFiltroChange: (filtro: string) => void;
  filtroActivo: string;
}

const ResumenCard: React.FC<ResumenProps> = ({
  totalControles,
  evaluados,
  pendientes,
  cumplidos,
  parciales,
  noCumplidos,
  noAplica,
  porcentajeCumplimiento,
  porcentajeCompletitud,
  onFiltroChange,
  filtroActivo
}) => {

  // Determinar el color según el porcentaje
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-emerald-500';
    if (percent >= 70) return 'bg-green-500';
    if (percent >= 50) return 'bg-amber-500';
    if (percent >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Opciones de filtro para mostrar en la UI
  const filtros = [
    { id: 'todos', label: 'Todos', count: totalControles },
    { id: 'evaluados', label: 'Evaluados', count: evaluados, icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
    { id: 'pendientes', label: 'Pendientes', count: pendientes, icon: <Clock className="h-4 w-4 text-gray-500" /> },
    { id: 'cumplidos', label: 'Cumplidos', count: cumplidos, icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
    { id: 'parciales', label: 'Parciales', count: parciales, icon: <AlertCircle className="h-4 w-4 text-amber-500" /> },
    { id: 'noCumplidos', label: 'No Cumplidos', count: noCumplidos, icon: <XCircle className="h-4 w-4 text-red-500" /> },
    { id: 'noAplica', label: 'No Aplica', count: noAplica, icon: <HelpCircle className="h-4 w-4 text-gray-500" /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de Controles</h2>
        
        {/* Círculos de progreso */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Círculo de cumplimiento */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 45}`} 
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - porcentajeCumplimiento / 100)}`}
                  strokeLinecap="round" 
                  className={`${getProgressColor(porcentajeCumplimiento)} transition-all duration-1000 ease-out transform -rotate-90 origin-center`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{porcentajeCumplimiento}%</span>
                <span className="text-xs text-gray-500">Cumplimiento</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 text-center">Nivel de cumplimiento de los controles evaluados</p>
          </div>
          
          {/* Círculo de completitud */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 45}`} 
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - porcentajeCompletitud / 100)}`}
                  strokeLinecap="round" 
                  className="text-blue-500 transition-all duration-1000 ease-out transform -rotate-90 origin-center"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{porcentajeCompletitud}%</span>
                <span className="text-xs text-gray-500">Completado</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 text-center">Porcentaje de controles evaluados</p>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Filtrar resultados:</h3>
          <div className="flex flex-wrap gap-2">
            {filtros.map(filtro => (
              <button
                key={filtro.id}
                onClick={() => onFiltroChange(filtro.id)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroActivo === filtro.id
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {filtro.icon && <span className="mr-1.5">{filtro.icon}</span>}
                {filtro.label} 
                <span className="ml-1.5 bg-white px-1.5 py-0.5 rounded-full text-xs font-semibold text-gray-600">
                  {filtro.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenCard;