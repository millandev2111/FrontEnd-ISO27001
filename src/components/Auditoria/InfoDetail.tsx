// @/components/auditoria/InfoDetail.tsx
import React from 'react';
import { User, Calendar } from 'lucide-react';
import { Auditoria } from './types';
import { getUserNames } from './utils';

interface InfoDetailProps {
    auditoria: Auditoria;
    fechaInicio: string;
    fechaFin: string;
}

const InfoDetail: React.FC<InfoDetailProps> = ({ auditoria, fechaInicio, fechaFin }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-slate-700">Auditores</h3>
                </div>
                <p className="text-slate-600 pl-11">{getUserNames(auditoria)}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-slate-700">Período</h3>
                </div>
                <p className="text-slate-600 pl-11">{fechaInicio} - {fechaFin}</p>
            </div>
        </div>
    );
};

export default InfoDetail;