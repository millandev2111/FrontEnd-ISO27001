import React from 'react';
import { Clock } from 'lucide-react';

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
                    onClick={() => onStateChange('En Progreso')}
                    disabled={actualizandoEstado || currentState === 'En Progreso'}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                        actualizandoEstado || currentState === 'En Progreso'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
                    }`}
                >
                    <Clock className="h-4 w-4" />
                    <span>En Progreso</span>
                </button>

                <button
                    onClick={() => onStateChange('Completada')}
                    disabled={actualizandoEstado || currentState === 'Completada'}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                        actualizandoEstado || currentState === 'Completada'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-200 text-green-700 hover:bg-green-300'
                    }`}
                >
                    {/* Icono para completada */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Completada</span>
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
