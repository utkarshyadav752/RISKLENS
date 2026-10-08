import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { WidgetCard } from '../design-system/shell/WidgetCard';
import { MetricCallout } from '../design-system/primitives/MetricCallout';
import { AuditTimeline } from '../design-system/workflows/AuditTimeline';
import { EscalationWorkflowCard } from '../design-system/workflows/EscalationWorkflowCard';
import { DataTable, type DataColumn } from '../design-system/tables/DataTable';
import { RiskBadge } from '../design-system/primitives/RiskBadge';
import { TableCellMono } from '../design-system/tables/TableCellMono';
import { Button } from '../design-system/primitives/Button';
import { ShieldCheck, FileCheck, CheckCircle2, Clock, Lock } from 'lucide-react';
import { ThreeComplianceVault3D } from '../design-system/visualizations/3d/ThreeComplianceVault3D';
import type { BreachAlert } from '../types/risk';

export const ComplianceAuditView: React.FC = () => {
  const { breaches, showToast, acknowledgeBreach, escalateBreach } = useDashboard();
  const [selectedBreach, setSelectedBreach] = useState<BreachAlert | null>(breaches[0] || null);

  const openBreaches = breaches.filter(b => b.status === 'open');

  const breachColumns: DataColumn<BreachAlert>[] = [
    {
      key: 'id',
      label: 'Incident ID',
      sortable: true,
      render: row => <span className="font-mono font-medium text-blue-400">{row.id}</span>
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: row => <RiskBadge severity={row.severity} size="sm" />
    },
    {
      key: 'title',
      label: 'Breach Rule Mandate',
      sortable: true,
      render: row => (
        <div className="flex flex-col">
          <span className="font-medium text-[#F1F3F5] text-xs">{row.title}</span>
          <span className="text-[10px] text-[#64748B] font-mono">{row.ruleReference}</span>
        </div>
      )
    },
    {
      key: 'desk',
      label: 'Trading Desk',
      sortable: true
    },
    {
      key: 'currentValue',
      label: 'Value vs Cap',
      sortable: true,
      align: 'right',
      render: row => (
        <div className="font-mono text-xs">
          <span className="text-[#FF6B6B] font-semibold">{row.currentValue}{row.unit}</span>
          <span className="text-[#64748B]"> / {row.thresholdValue}{row.unit}</span>
        </div>
      )
    },
    {
      key: 'slaSecondsRemaining',
      label: 'SLA Clock',
      sortable: true,
      align: 'right',
      render: row => {
        const m = Math.floor(row.slaSecondsRemaining / 60);
        const s = row.slaSecondsRemaining % 60;
        return (
          <span className="font-mono text-xs font-semibold text-[#FF922B] flex items-center justify-end gap-1">
            <Clock size={11} />
            {m}:{s.toString().padStart(2, '0')}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Workflow Status',
      sortable: true,
      render: row => (
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Compliance Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#151B26] border border-[#273142]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center font-mono text-emerald-400 font-bold text-base">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#F1F3F5]">
                Sarah Al-Mansoor
              </h1>
              <span className="text-xs text-[#94A3B8] font-mono">· Regulatory Compliance &amp; Audit Lead</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              Surveillance, SEC Rule 15c3-5 Pre-Trade Risk &amp; MiFID II RTS 27 Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileCheck size={14} />}
            onClick={() => showToast('SEC 15c3-5 Attestation Signed', 'Generated cryptographic attestation report for FINRA examiners.', 'safe')}
          >
            Sign Regulatory Attestation
          </Button>
        </div>
      </div>

      {/* Compliance KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCallout
          title="Active SLA Breaches"
          value={String(openBreaches.length)}
          benchmark="0 Target"
          deltaPercent={0}
          severity={openBreaches.length > 0 ? 'critical' : 'safe'}
          subtitle="Mandatory 15-Min Response"
        />

        <MetricCallout
          title="SEC 15c3-5 Pass Rate"
          value="99.98%"
          benchmark="> 99.9% Req"
          deltaPercent={0.02}
          deltaDirection="up"
          severity="safe"
          subtitle="14.2M Pre-Trade Filters Run"
        />

        <MetricCallout
          title="MiFID II Best Execution Quality"
          value="98.7%"
          benchmark="> 95.0% Standard"
          deltaPercent={1.4}
          deltaDirection="up"
          severity="safe"
          subtitle="RTS 27 Quarterly Benchmark"
        />

        <MetricCallout
          title="Ledger Integrity Status"
          value="100%"
          benchmark="SHA-256 Intact"
          severity="safe"
          subtitle="WORM Blockchain Sealed"
        />
      </div>

      {/* Row 2: Active SLA Queue Triage (DataTable + Active Inspection Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <WidgetCard
            title="Regulatory Limit Breach Queue"
            subtitle="Active operational incidents under statutory SLA oversight"
          >
            <DataTable<BreachAlert>
              data={breaches}
              columns={breachColumns}
              keyField="id"
              searchFields={['id', 'title', 'desk', 'ruleReference']}
              onRowClick={row => setSelectedBreach(row)}
              onAcknowledgeRow={row => acknowledgeBreach(row.id)}
              onEscalateRow={row => escalateBreach(row.id)}
              initialPageSize={5}
            />
          </WidgetCard>
        </div>

        <div className="lg:col-span-4">
          <WidgetCard
            title="Incident Escalation Triage"
            subtitle="Immediate SLA acknowledgment & remediation notes"
          >
            {selectedBreach ? (
              <EscalationWorkflowCard breach={selectedBreach} />
            ) : (
              <div className="p-8 text-center text-xs text-[#64748B] font-mono">
                Select an incident row to review operational remediation details.
              </div>
            )}
          </WidgetCard>
        </div>
      </div>

      {/* Row 3: 3D Cryptographic WORM Vault & Ledger Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <WidgetCard
            title="3D Cryptographic WORM Ledger Vault"
            subtitle="Immutable Merkle ring verification & SEC Rule 17a-4 cryptographic integrity lock"
          >
            <ThreeComplianceVault3D height={290} />
          </WidgetCard>
        </div>

        <div className="lg:col-span-7">
          <WidgetCard
            title="Immutable Cryptographic Audit Trail (SHA-256 Ledger)"
            subtitle="Write-Once-Read-Many regulatory log of every parameter change, breach, and trading freeze"
          >
            <AuditTimeline maxItems={6} />
          </WidgetCard>
        </div>
      </div>
    </div>
  );
};
