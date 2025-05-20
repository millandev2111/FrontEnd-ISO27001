// @/components/Resultados/TablaResultados.tsx
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, HelpCircle, Clock, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

interface Resultado {
  id: number;
  documentId?: string;
  completado: boolean;
  estado?: string;
  cumplimiento?: string;
  observaciones?: string;
  fechaEvaluacion?: string;
  controlId?: string;
  controlData?: any;
  attributes?: any;
}

interface TablaResultadosProps {
  resultados: Resultado[];
  loading: boolean;
}

const TablaResultados: React.FC<TablaResultadosProps> = ({ resultados, loading }) => {
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [columnaOrden, setColumnaOrden] = useState<string>('code');
  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const resultadosPorPagina = 10;

  // Función para manejar el cambio de orden
  const cambiarOrden = (columna: string) => {
    if (columnaOrden === columna) {
      setOrden(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(columna);
      setOrden('asc');
    }
  };

  // Función para obtener el ícono según el estado de cumplimiento
  const getIconoCumplimiento = (resultado: Resultado) => {
    if (!resultado.completado) {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }

    switch (resultado.cumplimiento?.toLowerCase()) {
      case 'cumple':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'cumple parcialmente':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'no cumple':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'no aplica':
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  // Función para obtener la clase según el estado de cumplimiento
  const getClaseCumplimiento = (resultado: Resultado) => {
    if (!resultado.completado) {
      return 'bg-gray-100 text-gray-600';
    }

    switch (resultado.cumplimiento?.toLowerCase()) {
      case 'cumple':
        return 'bg-emerald-100 text-emerald-800';
      case 'cumple parcialmente':
        return 'bg-amber-100 text-amber-800';
      case 'no cumple':
        return 'bg-red-100 text-red-800';
      case 'no aplica':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Filtrar resultados según la búsqueda
  const resultadosFiltrados = resultados.filter(resultado => {
    if (!busqueda) return true;
    
    const searchLower = busqueda.toLowerCase();
    const controlData = resultado.controlData || {};
    
    return (
      controlData.code?.toLowerCase().includes(searchLower) ||
      controlData.name?.toLowerCase().includes(searchLower) ||
      controlData.description?.toLowerCase().includes(searchLower) ||
      resultado.observaciones?.toLowerCase().includes(searchLower)
    );
  });

  // Ordenar resultados según la columna y orden seleccionados
  const resultadosOrdenados = [...resultadosFiltrados].sort((a, b) => {
    const controlA = a.controlData || {};
    const controlB = b.controlData || {};
    
    let valorA: any;
    let valorB: any;
    
    switch (columnaOrden) {
      case 'code':
        valorA = controlA.code || '';
        valorB = controlB.code || '';
        break;
      case 'name':
        valorA = controlA.name || '';
        valorB = controlB.name || '';
        break;
      case 'domain':
        valorA = controlA.domain || '';
        valorB = controlB.domain || '';
        break;
      case 'cumplimiento':
        valorA = a.cumplimiento || '';
        valorB = b.cumplimiento || '';
        break;
      default:
        valorA = controlA.code || '';
        valorB = controlB.code || '';
    }
    
    if (typeof valorA === 'string' && typeof valorB === 'string') {
      return orden === 'asc' 
        ? valorA.localeCompare(valorB) 
        : valorB.localeCompare(valorA);
    }
    
    return orden === 'asc' ? (valorA - valorB) : (valorB - valorA);
  });

  // Paginación
  const totalPaginas = Math.ceil(resultadosOrdenados.length / resultadosPorPagina);
  const resultadosPaginados = resultadosOrdenados.slice(
    (paginaActual - 1) * resultadosPorPagina,
    paginaActual * resultadosPorPagina
  );

  // Estado de carga
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resultados de la Evaluación</h2>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Resultados de la Evaluación</h2>
        
        {/* Barra de búsqueda */}
        <div className="mb-4 flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar control, nombre o descripción..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1); // Resetear a primera página al buscar
              }}
            />
          </div>
          
          <div className="ml-2 flex items-center text-sm">
            <Filter className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-600">
              {resultadosFiltrados.length} de {resultados.length} resultados
            </span>
          </div>
        </div>
        
        {/* Tabla de resultados */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th 
                  className="px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  onClick={() => cambiarOrden('code')}
                >
                  <div className="flex items-center">
                    <span>Control</span>
                    {columnaOrden === 'code' && (
                      orden === 'asc' ? 
                      <ChevronUp className="h-4 w-4 ml-1" /> : 
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  onClick={() => cambiarOrden('name')}
                >
                  <div className="flex items-center">
                    <span>Nombre</span>
                    {columnaOrden === 'name' && (
                      orden === 'asc' ? 
                      <ChevronUp className="h-4 w-4 ml-1" /> : 
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  onClick={() => cambiarOrden('domain')}
                >
                  <div className="flex items-center">
                    <span>Dominio</span>
                    {columnaOrden === 'domain' && (
                      orden === 'asc' ? 
                      <ChevronUp className="h-4 w-4 ml-1" /> : 
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  onClick={() => cambiarOrden('cumplimiento')}
                >
                  <div className="flex items-center">
                    <span>Cumplimiento</span>
                    {columnaOrden === 'cumplimiento' && (
                      orden === 'asc' ? 
                      <ChevronUp className="h-4 w-4 ml-1" /> : 
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resultadosPaginados.length > 0 ? (
                resultadosPaginados.map(resultado => {
                  const controlData = resultado.controlData || {};
                  return (
                    <tr 
                      key={resultado.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {controlData.code || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {controlData.name || 'Sin nombre'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {controlData.domain || 'Sin dominio'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          {getIconoCumplimiento(resultado)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getClaseCumplimiento(resultado)}`}>
                            {resultado.completado 
                              ? (resultado.cumplimiento || 'No especificado') 
                              : 'Pendiente'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No se encontraron resultados que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Mostrando {Math.min(resultadosOrdenados.length, (paginaActual - 1) * resultadosPorPagina + 1)} a {Math.min(paginaActual * resultadosPorPagina, resultadosOrdenados.length)} de {resultadosOrdenados.length} resultados
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className={`px-3 py-1 rounded border ${
                  paginaActual === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className={`px-3 py-1 rounded border ${
                  paginaActual === totalPaginas
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablaResultados;