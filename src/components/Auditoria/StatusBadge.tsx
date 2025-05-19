// @/components/auditoria/StatusBadge.tsx
import React from 'react';
import { Clock, Clipboard, CheckCircle, AlertCircle } from 'lucide-react';
import { getStatusColor } from './utils';

interface StatusBadgeProps {
    estado: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ estado }) => {
    // Obtener el ícono según el estado
    const getIcon = () => {
        switch (estado?.toLowerCase()) {
            case 'en progreso':
            case 'in_progress':
                return <Clock className="h-4 w-4 mr-1" />;
            case 'completada':
            case 'completed':
                return <CheckCircle className="h-4 w-4 mr-1" />;
           
            default:
                return <AlertCircle className="h-4 w-4 mr-1" />;
        }
    };

    return (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center ${getStatusColor(estado || 'pending')}`}>
            {getIcon()}
            {estado || 'En Progreso'}
        </div>
    );
};

export default StatusBadge;