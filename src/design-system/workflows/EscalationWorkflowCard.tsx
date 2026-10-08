import React, { useState } from 'react';
import { Clock, ShieldCheck, AlertTriangle, UserCheck } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { RiskBadge } from '../primitives/RiskBadge';
import { ThreeAlertMiniBeacon3D } from '../visualizations/3d/ThreeAlertMiniBeacon3D';
import { cn } from '../../utils/cn';
import type { BreachAlert } from '../../types/risk';

interface EscalationWorkflowCardProps {
  breach: BreachAlert;
  className?: string;
}

export const EscalationWorkflowCard: React.FC<EscalationWorkflowCardProps> = ({
  breach,
  className
}) => {
  const { acknowledgeBreach, escalateBreach } = useDashboard();
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatSLA = (seconds: number) => {
    if (seconds <= 0) return '00:00 (EXPIRED)';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAcknowledge = () => {
    setIsSubmitting(true);
    acknowledgeBreach(breach.id, resolutionNotes || undefined);
    setTimeout(() => {
      setIsSubmitting(false);
      setResolutionNotes('');
    }, 400);
  };

  const handleEscalate = () => {
    setIsSubmitting(true);
    escalateBreach(breach.id);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 400);
  };

  const isResolved = breach.status === 'acknowledged' || breach.status === 'remediated';

  return (
    <div
      className={cn(
        'p-4 rounded-xl border bg-[#151B26] border-[#273142] flex flex-col justify-between gap-3 transition-colors',
        breach.severity === 'critical' && !isResolved ? 'border-red-500/40' : '',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="p-0.5 rounded-lg bg-[#0B0E14] border border-[#273142] shadow-inner shrink-0">
            <ThreeAlertMiniBeacon3D
              severity={breach.severity}
              size={36}
              isPulsing={!isResolved}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#64748B]">{breach.id}</span>
              <span className="text-[#64748B]">·</span>
              <span className="font-mono text-[11px] text-[#94A3B8]">{breach.desk}</span>
            </div>
            <h3 className="text-xs font-semibold text-[#F1F3F5] mt-0.5">
              {breach.title}
            </h3>
          </div>
        </div>
        <RiskBadge severity={breach.severity} size="sm" />
      </div>

      {/* Metric comparison */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0B0E14] border border-[#273142] font-mono text-xs">
        <div>
          <span className="text-[10px] text-[#64748B] block">Observed Value:</span>
          <span className="text-[#FF6B6B] font-bold text-sm tabular-nums">
            {breach.currentValue} {breach.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#64748B] block">Permitted Limit:</span>
          <span className="text-[#94A3B8] font-medium text-sm tabular-nums">
            {breach.thresholdValue} {breach.unit}
          </span>
        </div>
      </div>

      <div className="text-[11px] font-mono text-[#64748B] flex items-center justify-between">
        <span className="truncate max-w-[200px]" title={breach.ruleReference}>
          {breach.ruleReference}
        </span>
        <div className="flex items-center gap-1.5 text-[#FF922B]">
          <Clock size={12} />
          <span className="tabular-nums font-semibold">
            {formatSLA(breach.slaSecondsRemaining)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isResolved ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-[#273142]/60">
          <input
            type="text"
            value={resolutionNotes}
            onChange={e => setResolutionNotes(e.target.value)}
            placeholder="Add operational remediation notes..."
            className="w-full bg-[#0B0E14] border border-[#273142] rounded px-2.5 py-1 text-xs text-[#F1F3F5] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleAcknowledge}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F2736] border border-[#273142] text-xs font-mono font-medium text-[#51CF66] hover:bg-[#273142] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <ShieldCheck size={13} />
              <span>Acknowledge SLA</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleEscalate}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-xs font-mono font-medium text-[#FF6B6B] hover:bg-red-600/30 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <AlertTriangle size={13} />
              <span>Escalate to CRO</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-[#273142]/60 flex items-center justify-between text-xs font-mono text-[#51CF66]">
          <div className="flex items-center gap-1.5">
            <UserCheck size={14} />
            <span>SLA Clock Stopped (Acknowledged)</span>
          </div>
          <span className="text-[10px] text-[#64748B] uppercase">{breach.status}</span>
        </div>
      )}
    </div>
  );
};
