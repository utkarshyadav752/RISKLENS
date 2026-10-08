/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { SideNavRail } from './design-system/shell/SideNavRail';
import { GlobalNavBar } from './design-system/shell/GlobalNavBar';
import { BreachAlertMarquee } from './design-system/workflows/BreachAlertMarquee';
import { BreadcrumbBar } from './design-system/shell/BreadcrumbBar';
import { CommandPalette } from './design-system/controls/CommandPalette';
import { WidgetCustomizerDrawer } from './design-system/workflows/WidgetCustomizerDrawer';
import { NotificationToastContainer } from './design-system/workflows/NotificationToast';
import { DrawerModal } from './design-system/shell/DrawerModal';
import { EscalationWorkflowCard } from './design-system/workflows/EscalationWorkflowCard';
import { ExecutiveCROView } from './views/ExecutiveCROView';
import { QuantAnalystView } from './views/QuantAnalystView';
import { ComplianceAuditView } from './views/ComplianceAuditView';
import { TradingDeskOpsView } from './views/TradingDeskOpsView';
import { DocumentationView } from './views/DocumentationView';
import { SpatialRiskUniverseView } from './views/SpatialRiskUniverseView';
import { PERSONA_PROFILES } from './types/persona';
import { ThreeBackground3D, type BackgroundThemeMode } from './design-system/shell/ThreeBackground3D';
import { ThreeAlertCommandCenter3D } from './design-system/visualizations/3d/ThreeAlertCommandCenter3D';

function DashboardContent() {
  const { currentPersona, activeNavTab, setActiveNavTab, activeDrawer, closeDrawer, breaches } = useDashboard();
  const [bgMode, setBgMode] = useState<BackgroundThemeMode>('quantum-grid');

  const profile = PERSONA_PROFILES[currentPersona];

  const getBreadcrumbs = () => {
    if (activeNavTab === 'docs') {
      return [{ label: 'Documentation Dossier', isCurrent: true }];
    }
    if (activeNavTab === 'spatial') {
      return [{ label: '3D Spatial Risk Universe', isCurrent: true }];
    }
    return [
      { label: profile.department },
      { label: profile.name, isCurrent: true }
    ];
  };

  const renderActiveView = () => {
    if (activeNavTab === 'docs') {
      return <DocumentationView />;
    }
    if (activeNavTab === 'spatial') {
      return <SpatialRiskUniverseView />;
    }

    switch (currentPersona) {
      case 'cro':
        return <ExecutiveCROView />;
      case 'quant':
        return <QuantAnalystView />;
      case 'compliance':
        return <ComplianceAuditView />;
      case 'desk_ops':
        return <TradingDeskOpsView />;
      default:
        return <ExecutiveCROView />;
    }
  };

  return (
    <div className="relative flex min-h-screen bg-[#0B0E14]/85 text-[#F1F3F5] font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* 3D Cybernetic Financial Space Background */}
      <ThreeBackground3D mode={bgMode} intensity={0.85} />

      {/* Collapsible Left Navigation Rail */}
      <div className="relative z-20 flex">
        <SideNavRail
          activeNavTab={activeNavTab}
          onSelectNavTab={tabId => setActiveNavTab(tabId)}
        />
      </div>

      {/* Main Execution Column */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Navigation Bar */}
        <GlobalNavBar bgMode={bgMode} onSelectBgMode={setBgMode} />

        {/* Priority Crisis Alert Marquee Banner */}
        <BreachAlertMarquee />

        {/* Workspace Canvas */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto space-y-4">
          {/* Breadcrumb Navigation Trail */}
          <div className="flex items-center justify-between pb-1">
            <BreadcrumbBar items={getBreadcrumbs()} />
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#64748B]">
              <span>Active Profile:</span>
              <span className="text-[#94A3B8] font-semibold">{profile.title}</span>
            </div>
          </div>

          {/* Persona View Content */}
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <WidgetCustomizerDrawer />
      <NotificationToastContainer />

      {/* Global Slide-Over Drawer for Breach Notifications */}
      <DrawerModal
        isOpen={activeDrawer?.type === 'breaches'}
        onClose={closeDrawer}
        title="3D Regulatory Breach & Alert Command Center"
        subtitle="Real-time spatial breach topology & live SLA mitigation workflows"
        width="xl"
      >
        <div className="space-y-4">
          {/* 3D Interactive Breach Radar & Topology Center */}
          <ThreeAlertCommandCenter3D />

          <div className="pt-2">
            <h3 className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
              Desk SLA Remediation Workflows ({breaches.length})
            </h3>
            <div className="space-y-3">
              {breaches.map(breach => (
                <EscalationWorkflowCard key={breach.id} breach={breach} />
              ))}
            </div>
          </div>
        </div>
      </DrawerModal>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
