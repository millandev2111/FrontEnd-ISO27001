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
    return (
        <div className={`${bgColor} rounded-lg p-4 border ${borderColor} flex items-center justify-between`}>
            <div>
                <p className={`${textColor} font-medium`}>{title}</p>
                <p className="text-3xl font-bold text-slate-800">
                    {value}
                </p>
            </div>
            <div className={`${iconBgColor} p-3 rounded-full`}>
                {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${iconColor}` })}
            </div>
        </div>
    );
};

export default StatCard;