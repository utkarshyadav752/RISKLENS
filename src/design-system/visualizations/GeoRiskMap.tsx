import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { RiskBadge } from '../primitives/RiskBadge';
import type { SeverityLevel } from '../../types/risk';

interface RegionData {
  id: string;
  name: string;
  exposureM: number;
  limitM: number;
  counterpartiesCount: number;
  averageRating: string;
  varContributionPct: number;
  severity: SeverityLevel;
  svgCoordinates: { x: number; y: number; r: number };
}

const REGIONS: RegionData[] = [
  {
    id: 'na',
    name: 'North America (US & CA)',
    exposureM: 184.5,
    limitM: 250.0,
    counterpartiesCount: 38,
    averageRating: 'AA-',
    varContributionPct: 44.2,
    severity: 'safe',
    svgCoordinates: { x: 90, y: 55, r: 24 }
  },
  {
    id: 'emea',
    name: 'Europe, Middle East & Africa',
    exposureM: 122.8,
    limitM: 140.0,
    counterpartiesCount: 26,
    averageRating: 'A+',
    varContributionPct: 29.5,
    severity: 'high',
    svgCoordinates: { x: 215, y: 50, r: 20 }
  },
  {
    id: 'apac',
    name: 'Asia-Pacific (JP, HK, SG, AU)',
    exposureM: 92.4,
    limitM: 110.0,
    counterpartiesCount: 19,
    averageRating: 'AA',
    varContributionPct: 22.1,
    severity: 'medium',
    svgCoordinates: { x: 340, y: 70, r: 18 }
  },
  {
    id: 'latam',
    name: 'Latin America (BR, MX, CL)',
    exposureM: 17.3,
    limitM: 30.0,
    counterpartiesCount: 7,
    averageRating: 'BBB+',
    varContributionPct: 4.2,
    severity: 'safe',
    svgCoordinates: { x: 130, y: 115, r: 12 }
  }
];

export const GeoRiskMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(REGIONS[1]); // Default EMEA

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
        <span>Global Counterparty Credit Exposure</span>
        <span className="text-[#64748B]">Basel III Country Risk Weighted</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Stylized Vector World Map Canvas */}
        <div className="lg:col-span-7 bg-[#0B0E14] border border-[#273142] rounded-lg p-2 relative flex items-center justify-center">
          <svg viewBox="0 0 420 160" className="w-full h-36 overflow-visible">
            {/* World Continent outline approximations */}
            {/* North America */}
            <path
              d="M 50 30 Q 90 25 120 40 Q 110 80 80 85 Q 50 60 50 30 Z"
              fill="#1F2736"
              stroke="#273142"
              strokeWidth="1"
            />
            {/* South America */}
            <path
              d="M 100 95 Q 130 95 135 125 Q 120 150 110 145 Q 95 120 100 95 Z"
              fill="#1F2736"
              stroke="#273142"
              strokeWidth="1"
            />
            {/* Europe & Africa */}
            <path
              d="M 180 30 Q 230 30 240 50 Q 230 110 200 135 Q 185 90 180 30 Z"
              fill="#1F2736"
              stroke="#273142"
              strokeWidth="1"
            />
            {/* Asia & Australia */}
            <path
              d="M 260 30 Q 370 25 380 75 Q 360 110 320 90 Q 290 60 260 30 Z"
              fill="#1F2736"
              stroke="#273142"
              strokeWidth="1"
            />
            {/* Australia */}
            <path
              d="M 330 110 Q 370 110 375 135 Q 340 145 330 110 Z"
              fill="#1F2736"
              stroke="#273142"
              strokeWidth="1"
            />

            {/* Regional Pulse Nodes */}
            {REGIONS.map(reg => {
              const isSelected = selectedRegion.id === reg.id;
              const color =
                reg.severity === 'critical' ? '#FF6B6B' :
                reg.severity === 'high' ? '#FF922B' :
                reg.severity === 'medium' ? '#FCC419' : '#51CF66';

              return (
                <g
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  {/* Pulse ring */}
                  <circle
                    cx={reg.svgCoordinates.x}
                    cy={reg.svgCoordinates.y}
                    r={reg.svgCoordinates.r}
                    fill={color}
                    fillOpacity={isSelected ? '0.25' : '0.12'}
                    stroke={color}
                    strokeWidth={isSelected ? '2' : '1'}
                    className={isSelected ? 'animate-pulse' : ''}
                  />
                  <circle
                    cx={reg.svgCoordinates.x}
                    cy={reg.svgCoordinates.y}
                    r={isSelected ? '5' : '3.5'}
                    fill={color}
                  />
                  <text
                    x={reg.svgCoordinates.x}
                    y={reg.svgCoordinates.y - reg.svgCoordinates.r - 2}
                    fill="#F1F3F5"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    ${reg.exposureM}M
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Region Detail Pane */}
        <div className="lg:col-span-5 bg-[#1F2736]/50 border border-[#273142] rounded-lg p-3 text-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#273142]/60 mb-2">
              <span className="font-semibold text-[#F1F3F5] text-xs">
                {selectedRegion.name}
              </span>
              <RiskBadge severity={selectedRegion.severity} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mb-2">
              <div>
                <span className="text-[#64748B] block">Exposure:</span>
                <span className="text-[#F1F3F5] font-semibold">${selectedRegion.exposureM}M</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Cap Limit:</span>
                <span className="text-[#94A3B8]">${selectedRegion.limitM}M</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Counterparties:</span>
                <span className="text-[#F1F3F5]">{selectedRegion.counterpartiesCount} Active</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Avg Credit:</span>
                <span className="text-[#51CF66] font-semibold">{selectedRegion.averageRating}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#273142]/60 font-mono text-[10px] text-[#94A3B8] flex justify-between">
            <span>VaR Allocation:</span>
            <span className="text-[#FF922B] font-semibold">{selectedRegion.varContributionPct}% of Firmwide</span>
          </div>
        </div>
      </div>
    </div>
  );
};
