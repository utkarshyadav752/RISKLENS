import React from 'react';
import { X, CheckCircle2, AlertOctagon, TriangleAlert, Info } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { ThreeAlertMiniBeacon3D } from '../visualizations/3d/ThreeAlertMiniBeacon3D';
import { cn } from '../../utils/cn';
import type { SeverityLevel } from '../../types/risk';

export const NotificationToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useDashboard();

  if (toasts.length === 0) return null;

  const renderIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon size={16} className="text-[#FF6B6B] shrink-0" />;
      case 'high':
        return <TriangleAlert size={16} className="text-[#FF922B] shrink-0" />;
      case 'safe':
        return <CheckCircle2 size={16} className="text-[#51CF66] shrink-0" />;
      case 'medium':
      case 'info':
      default:
        return <Info size={16} className="text-[#4DABF7] shrink-0" />;
    }
  };

  const borderClasses: Record<SeverityLevel, string> = {
    critical: 'border-[#FF6B6B]/60 bg-[#151B26]',
    high: 'border-[#FF922B]/60 bg-[#151B26]',
    medium: 'border-[#FCC419]/60 bg-[#151B26]',
    safe: 'border-[#51CF66]/60 bg-[#151B26]',
    info: 'border-[#4DABF7]/60 bg-[#151B26]'
  };

  return (
    <div
      role="region"
      aria-label="System notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto p-3.5 rounded-xl border shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200',
            borderClasses[toast.severity]
          )}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-[#0B0E14] border border-[#273142]">
              <ThreeAlertMiniBeacon3D
                severity={toast.severity}
                size={30}
                isPulsing={toast.severity === 'critical' || toast.severity === 'high'}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#F1F3F5] tracking-tight">
                {toast.title}
              </span>
              <span className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
                {toast.message}
              </span>
              <span className="text-[9px] font-mono text-[#64748B] mt-1">
                {toast.timestamp}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="p-1 rounded text-[#64748B] hover:text-[#F1F3F5] transition-colors"
            aria-label="Dismiss notification"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
