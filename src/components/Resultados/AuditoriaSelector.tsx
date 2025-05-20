// @/components/Evaluaciones/AuditoriaSelector.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { ChevronDown, Search, Calendar, CheckCircle } from 'lucide-react';
import { formatearFecha } from '@/components/Auditoria/utils';

interface Auditoria {
  id: number;
  documentId: string;
  title: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  attributes?: any;
}

interface AuditoriaSelectorProps {
  selectedAuditoriaId: string | null;
  onSelectAuditoria: (documentId: string) => void;
}

const AuditoriaSelector: React.FC<AuditoriaSelectorProps> = ({
  selectedAuditoriaId,
  onSelectAuditoria
}) => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Obtener listado de auditorías
  useEffect(() => {
    const fetchAuditorias = async () => {
      setLoading(true);
      try {
        const token = getCookie('auth_token');
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const res = await axios.get('https://backend-iso27001.onrender.com/api/auditorias', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            sort: ['createdAt:desc'],
            pagination: { pageSize: 100 }
          }
        });
        
        if (res.data && Array.isArray(res.data.data)) {
          // Formatear datos
          const auditoriasData = res.data.data.map((item: any) => ({
            id: item.id,
            documentId: item.attributes?.documentId || item.documentId,
            title: item.attributes?.title || item.title || `Auditoría #${item.id}`,
            state: item.attributes?.state || item.state,
            startDate: item.attributes?.startDate || item.startDate,
            endDate: item.attributes?.endDate || item.endDate,
            attributes: item.attributes
          }));
          
          setAuditorias(auditoriasData);
          
          // Si no hay una auditoría seleccionada y tenemos auditorías, seleccionar la primera
          if (!selectedAuditoriaId && auditoriasData.length > 0) {
            onSelectAuditoria(auditoriasData[0].documentId);
          }
        }
      } catch (err) {
        console.error('Error cargando auditorías:', err);
        setError(typeof err === 'object' && err !== null && 'message' in err 
          ? String(err.message) 
          : 'Error cargando auditorías');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuditorias();
  }, [selectedAuditoriaId, onSelectAuditoria]);
  
  // Filtrar auditorías según término de búsqueda
  const filteredAuditorias = auditorias.filter(auditoria => 
    auditoria.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auditoria.documentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Obtener la auditoría seleccionada
  const selectedAuditoria = auditorias.find(a => a.documentId === selectedAuditoriaId);
  
  // Obtener el estado de la auditoría para mostrar el badge
  const getStateBadgeClass = (state?: string) => {
    switch (state?.toLowerCase()) {
      case 'completada':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'en progreso':
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 relative z-30">
      {/* Botón selector */}
      <button
        className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {selectedAuditoria ? (
            <>
              <div className="mr-2">
                <div className="font-medium">{selectedAuditoria.title}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatearFecha(selectedAuditoria.startDate || '')} - {formatearFecha(selectedAuditoria.endDate || '')}
                </div>
              </div>
              <div className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${getStateBadgeClass(selectedAuditoria.state)}`}>
                {selectedAuditoria.state || 'Pendiente'}
              </div>
            </>
          ) : (
            <span className="text-gray-500">Selecciona una auditoría</span>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
          {/* Búsqueda */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar auditoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Lista de auditorías */}
          <div className="overflow-y-auto max-h-60">
            {filteredAuditorias.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No se encontraron auditorías</div>
            ) : (
              filteredAuditorias.map((auditoria) => (
                <button
                  key={auditoria.documentId}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                    selectedAuditoriaId === auditoria.documentId ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    onSelectAuditoria(auditoria.documentId);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{auditoria.title}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatearFecha(auditoria.startDate || '')}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStateBadgeClass(auditoria.state)}`}>
                        {auditoria.state || 'Pendiente'}
                      </div>
                      {selectedAuditoriaId === auditoria.documentId && (
                        <CheckCircle className="h-4 w-4 text-blue-500 ml-2" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditoriaSelector;