// @/components/auditoria/SugerenciaEstado.tsx
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SugerenciaEstadoProps {
    estadoSugerido: string | null;
    actualizandoEstado: boolean;
    onActualizarEstado: (estado: string) => void;
}

const SugerenciaEstado: React.FC<SugerenciaEstadoProps> = ({ 
    estadoSugerido, 
    actualizandoEstado, 
    onActualizarEstado 
}) => {
    if (!estadoSugerido) return null;

    return (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                <p className="text-blue-800">
                    Según el progreso actual, se sugiere actualizar el estado a <strong>{estadoSugerido}</strong>
                </p>
            </div>
            <button
                onClick={() => onActualizarEstado(estadoSugerido)}
                disabled={actualizandoEstado}
                className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
                    actualizandoEstado ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {actualizandoEstado ? (
                    <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Actualizando...</span>
                    </>
                ) : (
                    <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Actualizar estado</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default SugerenciaEstado;