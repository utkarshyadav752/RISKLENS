import React from 'react';
import { cn } from '../../utils/cn';
import { useDashboard } from '../../context/DashboardContext';
import type { LayoutDensity } from '../../types/persona';

interface DashboardGridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardGridContainer: React.FC<DashboardGridContainerProps> = ({
  children,
  className
}) => {
  const { density } = useDashboard();

  const densityGaps: Record<LayoutDensity, string> = {
    comfortable: 'gap-6 p-6',
    standard: 'gap-4 p-5',
    compact: 'gap-3 p-3.5'
  };

  return (
    <main
      role="main"
      className={cn(
        'w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 transition-all duration-150',
        densityGaps[density],
        className
      )}
    >
      {children}
    </main>
  );
};
