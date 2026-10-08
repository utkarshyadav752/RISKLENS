import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { PERSONA_PROFILES, type PersonaRole } from '../../types/persona';
import { cn } from '../../utils/cn';

interface PersonaSwitcherProps {
  className?: string;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({ className }) => {
  const { currentPersona, setPersona, density } = useDashboard();

  const personas: PersonaRole[] = ['cro', 'quant', 'compliance', 'desk_ops'];

  return (
    <div
      role="group"
      aria-label="Target User Persona Selector"
      className={cn('inline-flex items-center bg-[#0B0E14] p-1 rounded-xl border border-[#273142]', className)}
    >
      {personas.map(role => {
        const profile = PERSONA_PROFILES[role];
        const isActive = currentPersona === role;

        return (
          <button
            key={role}
            type="button"
            onClick={() => setPersona(role)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all select-none focus:outline-none focus:ring-1 focus:ring-blue-500 whitespace-nowrap',
              isActive
                ? 'bg-[#1F2736] text-[#F1F3F5] shadow-sm font-semibold border border-[#273142]'
                : 'text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#151B26]'
            )}
            aria-pressed={isActive}
          >
            {/* Initials Avatar */}
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold',
                role === 'cro' ? 'bg-blue-600/30 text-blue-400' :
                role === 'quant' ? 'bg-purple-600/30 text-purple-400' :
                role === 'compliance' ? 'bg-emerald-600/30 text-emerald-400' :
                'bg-amber-600/30 text-amber-400'
              )}
            >
              {profile.avatarInitials}
            </span>

            <div className="flex flex-col text-left">
              <span className="leading-tight">{profile.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono text-[#64748B] leading-none">
                {role.toUpperCase()}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
