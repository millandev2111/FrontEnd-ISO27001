// @/components/auditoria/EstadoButtons.tsx
import React from 'react';
import { Clipboard, Clock, CheckCircle } from 'lucide-react';

interface EstadoButtonsProps {
    currentState: string;
    actualizandoEstado: boolean;
    onStateChange: (nuevoEstado: string) => void;
}

const EstadoButtons: React.FC<EstadoButtonsProps> = ({
    currentState,
    actualizandoEstado,
    onStateChange
}) => {
    return (
        <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-medium text-slate-700 mb-3">Actualización manual de estado</h3>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onStateChange('Pendiente')}
                    disabled={actualizandoEstado || currentState === 'Pendiente'}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${actualizandoEstado || currentState === 'Pendiente'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                >
                    <Clipboard className="h-4 w-4" />
                    <span>Pendiente</span>
                </button>
                <button
                    onClick={() => onStateChange('En Progreso')}
                    disabled={actualizandoEstado || currentState === 'En Progreso'}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${actualizandoEstado || currentState === 'En Progreso'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
                        }`}
                >
                    <Clock className="h-4 w-4" />
                    <span>En Progreso</span>
                </button>
                
            </div>
            {actualizandoEstado && (
                <div className="text-blue-600 mt-2 flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Actualizando estado...
                </div>
            )}

        </div>
    );
};

export default EstadoButtons;