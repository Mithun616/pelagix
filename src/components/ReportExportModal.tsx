import React, { useState } from 'react';
import { X, FileDown, Copy, Check, FileText } from 'lucide-react';
import { Region, IPCCScenario, ProjectionYear, SimulationState } from '../types/index.ts';
import { calculateRiskScore, DEFAULT_RISK_WEIGHTS } from '../utils/riskScoring.ts';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: Region;
  selectedScenario: IPCCScenario;
  selectedYear: ProjectionYear;
  simulationState: SimulationState;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  selectedScenario,
  selectedYear,
  simulationState,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const score = calculateRiskScore(
    selectedRegion,
    selectedScenario,
    selectedYear,
    DEFAULT_RISK_WEIGHTS,
    simulationState.closedRoadIds.length,
    simulationState.simulatedSeaLevelSurgeCm
  );

  const proj = selectedRegion.projections.find(
    p => p.scenario === selectedScenario && p.year === selectedYear
  );

  const reportMarkdown = `# PELAGIX COASTAL IMPACT INTELLIGENCE DOSSIER
Generated: 2026-10-15T09:30:00Z
Platform: PELAGIX Global Coastal Risk Intelligence v2.4

## BASIN PROFILE
- Basin: ${selectedRegion.name}
- Country: ${selectedRegion.country}
- Coordinates: ${selectedRegion.coordinates[0].toFixed(4)}°N, ${selectedRegion.coordinates[1].toFixed(4)}°W
- Coverage Classification: ${selectedRegion.dataCoverage.toUpperCase()}
- Copernicus DEM Mean Elevation: ${selectedRegion.elevationSummary.meanMeters}m (${selectedRegion.elevationSummary.sub2mMetersPercent}% sub-2m)
- WorldPop Estimated Exposed Population (<2m): ${selectedRegion.populationSummary.inSub2mZone.toLocaleString()} residents
- Mapped Critical Facilities: ${selectedRegion.infrastructureSummary.hospitals} Hospitals, ${selectedRegion.infrastructureSummary.shelters} Evacuation Shelters

## IPCC AR6 SEA-LEVEL PROJECTION
- Pathway Scenario: ${selectedScenario}
- Horizon Year: ${selectedYear}
- Projected Median Rise: +${proj?.medianCm || 0} cm
- 17th–83rd Confidence Interval: ${proj?.p17Cm} to ${proj?.p83Cm} cm
- 5th–95th Extreme Range: ${proj?.p05Cm} to ${proj?.p95Cm} cm
- Projection Source: NASA Sea Level Change Team / IPCC AR6 WGI

## DECISION-SUPPORT PRIORITY SCORE
- Composite Priority Index: ${score.isComplete ? `${score.totalScore} / 100` : 'INCOMPLETE ASSESSMENT'}
- Data Completeness & Confidence: ${score.confidenceScore}%
- Component Sub-Scores:
  * Coastal Exposure: ${score.exposureScore} / 100 (Weight: 40%)
  * Demographics Vulnerability: ${score.populationScore} / 100 (Weight: 30%)
  * Critical Access Risk: ${score.accessScore} / 100 (Weight: 30%)

## OPERATIONAL SIMULATION STATE
- Active Disruptions: ${simulationState.closedRoadIds.length} road segment(s) closed
- Simulated Surge Offset: +${simulationState.simulatedSeaLevelSurgeCm} cm
- Simulated Rainfall Pulse: ${simulationState.simulatedRainfallMm} mm / 6h

## SCIENTIFIC LIMITATIONS NOTICE
Projections are based on peer-reviewed IPCC AR6 shared socioeconomic pathways. Elevation alone does not predict local flood depth without hydrodynamic modeling and barrier analysis. Priority scores represent decision-support estimates for resource allocation.
`;

  const handleDownloadJson = () => {
    const data = {
      reportType: 'PELAGIX_COASTAL_IMPACT_DOSSIER',
      timestamp: '2026-10-15T09:30:00Z',
      region: selectedRegion,
      scenario: selectedScenario,
      year: selectedYear,
      score,
      simulationState,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pelagix-dossier-${selectedRegion.id}-${selectedYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white text-sm">Export Executive Intelligence Dossier</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-400">
            Export a comprehensive briefing dossier summarizing IPCC projection intervals, topographical vulnerability, population in low-elevation coastal zones, and road accessibility for <strong>{selectedRegion.name}</strong>.
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 max-h-64 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {reportMarkdown}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download JSON Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
