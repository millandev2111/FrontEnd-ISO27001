// @/components/auditoria/StatCard.tsx
import React, { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconBgColor: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    bgColor,
    borderColor,
    textColor,
    iconBgColor,
    iconColor
}) => {
    // Renderizar el icono directamente sin modificarlo
    const renderIcon = () => {
        // Si el icono es un elemento de React, intentamos usar su tipo más específico
        if (React.isValidElement(icon)) {
            // Usar un tipo más seguro con una aserción de tipo
            return React.cloneElement(icon as React.ReactElement<any>, { 
                className: `h-6 w-6 ${iconColor}` 
            });
        }
        // Si no es un elemento válido, devolvemos el icono como está
        return icon;
    };

    return (
        <div className={`${bgColor} rounded-lg p-4 border ${borderColor} flex items-center justify-between`}>
            <div>
                <p className={`${textColor} font-medium`}>{title}</p>
                <p className="text-3xl font-bold text-slate-800">
                    {value}
                </p>
            </div>
            <div className={`${iconBgColor} p-3 rounded-full`}>
                {renderIcon()}
            </div>
        </div>
    );
};

export default StatCard;