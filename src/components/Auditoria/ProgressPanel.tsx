// @/components/auditoria/ProgressPanel.tsx
import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import CircularProgressBar from './CircularProgressBar';
import { getProgressColor } from './utils';

interface ProgressPanelProps {
    progreso: number;
    controlesEvaluados: number;
    totalControles: number;
    onContinuarClick: () => void;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({
    progreso,
    controlesEvaluados,
    totalControles,
    onContinuarClick
}) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                Progreso
            </h2>

            <div className="flex justify-center mb-4">
                <CircularProgressBar percentage={progreso} />
            </div>

            <div className="text-center">
                <div className="text-sm font-medium text-slate-600 mb-3">
                    Controles evaluados: {controlesEvaluados} de {totalControles}
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                    <div
                        className={`h-2.5 rounded-full transition-all ${getProgressColor(progreso)}`}
                        style={{ width: `${progreso}%` }}
                    />
                </div>

                <button
                    onClick={onContinuarClick}
                    className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors mt-2 font-medium flex items-center justify-center gap-2"
                >
                    <ClipboardCheck className="h-4 w-4" />
                    <span>Continuar evaluación</span>
                </button>
            </div>
        </div>
    );
};

export default ProgressPanel;