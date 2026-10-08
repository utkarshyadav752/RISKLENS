import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Hash, ExternalLink } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { cn } from '../../utils/cn';
import type { AuditLogEntry } from '../../types/risk';

interface AuditTimelineProps {
  maxItems?: number;
  className?: string;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ maxItems = 10, className }) => {
  const { auditLogs, showToast } = useDashboard();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const displayedLogs = auditLogs.slice(0, maxItems);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    showToast('Hash Copied', 'SHA-256 cryptographic signature copied to clipboard.', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getEventBadgeColor = (type: AuditLogEntry['eventType']) => {
    switch (type) {
      case 'BREACH_DETECTED':
        return 'bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]/40';
      case 'CIRCUIT_BREAKER_TRIPPED':
        return 'bg-red-600/30 text-red-300 border-red-500/50';
      case 'LIMIT_OVERRIDE':
        return 'bg-[#FF922B]/20 text-[#FF922B] border-[#FF922B]/40';
      case 'THRESHOLD_UPDATED':
        return 'bg-[#4DABF7]/20 text-[#4DABF7] border-[#4DABF7]/40';
      case 'SLA_ACKNOWLEDGED':
      case 'COMPLIANCE_SIGN_OFF':
      default:
        return 'bg-[#51CF66]/20 text-[#51CF66] border-[#51CF66]/40';
    }
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#51CF66]" />
          <span>WORM Ledger (Write Once, Read Many)</span>
        </div>
        <span className="text-[#64748B]">SHA-256 Immutable Audit Trail</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#273142]">
        {displayedLogs.map((log) => {
          return (
            <div
              key={log.id}
              className="relative flex flex-col gap-1 p-3 rounded-lg bg-[#0B0E14] border border-[#273142] hover:border-[#3B82F6]/50 transition-colors"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[23px] top-4 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#151B26]" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-semibold border uppercase',
                      getEventBadgeColor(log.eventType)
                    )}
                  >
                    {log.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-semibold text-[#F1F3F5]">{log.desk}</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-[#64748B]">
                  <span>{log.timestamp}</span>
                  <span>·</span>
                  <span>{log.operator}</span>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                {log.description}
              </p>

              {/* Cryptographic SHA-256 Stamp */}
              <div className="mt-2 pt-2 border-t border-[#273142]/60 flex items-center justify-between font-mono text-[10px] text-[#64748B]">
                <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                  <Hash size={11} className="shrink-0 text-blue-400" />
                  <span className="truncate text-[#94A3B8]">{log.sha256Hash}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#51CF66] font-semibold">{log.signatureStatus}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(log.sha256Hash)}
                    className="p-1 rounded text-[#64748B] hover:text-[#F1F3F5] transition-colors"
                    title="Copy SHA-256 Hash"
                    aria-label="Copy SHA-256 Hash"
                  >
                    {copiedHash === log.sha256Hash ? <Check size={12} className="text-[#51CF66]" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
