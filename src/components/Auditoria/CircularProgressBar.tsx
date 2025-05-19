// @/components/auditoria/CircularProgressBar.tsx
import React from 'react';

interface CircularProgressBarProps {
    percentage: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ percentage }) => {
    const circumference = 2 * Math.PI * 40; // Radio = 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    let progressColor;

    if (percentage >= 75) progressColor = 'text-emerald-500';
    else if (percentage >= 50) progressColor = 'text-amber-500';
    else if (percentage >= 25) progressColor = 'text-orange-500';
    else progressColor = 'text-red-500';

    return (
        <div className="relative h-32 w-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                />

                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`${progressColor} transform -rotate-90 origin-center transition-all duration-1000 ease-out`}
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
            </div>
        </div>
    );
};

export default React.memo(CircularProgressBar);