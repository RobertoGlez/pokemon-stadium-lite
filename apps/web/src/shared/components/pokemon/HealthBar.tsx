import React from 'react';

interface HealthBarProps {
    currentHp: number;
    maxHp: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ currentHp, maxHp }) => {
    // Math to percentage, securely bounded
    const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

    // Aesthetic Color thresholds (from frontend_desing_guide.md semantics)
    let colorClass = 'bg-[#22C55E]'; // Success Green
    if (percentage <= 20) colorClass = 'bg-[#EF4444]'; // Danger Red
    else if (percentage <= 50) colorClass = 'bg-[#F59E0B]'; // Warning Yellow

    return (
        <div className="w-full flex justify-center items-center">
            <div className="w-48 bg-gray-900 rounded-full h-3 border border-gray-700 overflow-hidden relative">
                <div
                    className={`h-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="ml-3 text-xs font-bold font-mono tracking-widest text-muted-foreground">
                {currentHp}/{maxHp}
            </span>
        </div>
    );
};
