import React, { useState } from 'react';
import { COASTAL_REGIONS, INITIAL_LIVE_EVENTS } from './data/regionsData.ts';
import { Region, IPCCScenario, ProjectionYear, SimulationState, LiveEvent } from './types/index.ts';
import { Header } from './components/Header.tsx';
import { Sidebar, NavSection } from './components/Sidebar.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ReportExportModal } from './components/ReportExportModal.tsx';

// 9 Dedicated Views
import { GlobalOverviewView } from './views/GlobalOverviewView.tsx';
import { SeaLevelTrendsView } from './views/SeaLevelTrendsView.tsx';
import { CoastalRiskMapView } from './views/CoastalRiskMapView.tsx';
import { ScenarioExplorerView } from './views/ScenarioExplorerView.tsx';
import { InfrastructureAccessibilityView } from './views/InfrastructureAccessibilityView.tsx';
import { LiveEventMonitorView } from './views/LiveEventMonitorView.tsx';
import { ExplainableRiskView } from './views/ExplainableRiskView.tsx';
import { DataSourcesCoverageView } from './views/DataSourcesCoverageView.tsx';
import { MethodologyUncertaintyView } from './views/MethodologyUncertaintyView.tsx';

export function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('overview');
  const [selectedRegion, setSelectedRegion] = useState<Region>(COASTAL_REGIONS[0]);
  const [selectedScenario, setSelectedScenario] = useState<IPCCScenario>('SSP2-4.5');
  const [selectedYear, setSelectedYear] = useState<ProjectionYear>(2050);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(INITIAL_LIVE_EVENTS);

  const [simulationState, setSimulationState] = useState<SimulationState>({
    active: false,
    simulatedRainfallMm: 0,
    closedRoadIds: [],
    selectedHospitalTarget: '',
    shelterOccupancyPercent: 45,
    simulatedSeaLevelSurgeCm: 0,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleRoadClosure = (roadId: string) => {
    setSimulationState(prev => {
      const exists = prev.closedRoadIds.includes(roadId);
      const newClosed = exists
        ? prev.closedRoadIds.filter(id => id !== roadId)
        : [...prev.closedRoadIds, roadId];
      return {
        ...prev,
        active: newClosed.length > 0 || prev.simulatedRainfallMm > 0 || prev.simulatedSeaLevelSurgeCm > 0,
        closedRoadIds: newClosed,
      };
    });
  };

  const handleResetSimulation = () => {
    setSimulationState({
      active: false,
      simulatedRainfallMm: 0,
      closedRoadIds: [],
      selectedHospitalTarget: '',
      shelterOccupancyPercent: 45,
      simulatedSeaLevelSurgeCm: 0,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        regions={COASTAL_REGIONS}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        liveEvents={liveEvents}
        isSimulating={simulationState.active}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          selectedRegion={selectedRegion}
          isSimulating={simulationState.active}
          isOpenMobile={isMobileSidebarOpen}
          onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 pb-12">
          {currentSection === 'overview' && (
            <GlobalOverviewView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              selectedScenario={selectedScenario}
              onChangeScenario={setSelectedScenario}
              selectedYear={selectedYear}
              onChangeYear={setSelectedYear}
              simulationState={simulationState}
              onNavigateTo={sec => setCurrentSection(sec as NavSection)}
            />
          )}

          {currentSection === 'trends' && (
            <SeaLevelTrendsView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          )}

          {currentSection === 'map' && (
            <CoastalRiskMapView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              selectedScenario={selectedScenario}
              onChangeScenario={setSelectedScenario}
              selectedYear={selectedYear}
              onChangeYear={setSelectedYear}
              simulationState={simulationState}
            />
          )}

          {currentSection === 'scenarios' && (
            <ScenarioExplorerView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              selectedScenario={selectedScenario}
              onChangeScenario={setSelectedScenario}
              selectedYear={selectedYear}
              onChangeYear={setSelectedYear}
            />
          )}

          {currentSection === 'infrastructure' && (
            <InfrastructureAccessibilityView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              simulationState={simulationState}
              onToggleRoadClosure={handleToggleRoadClosure}
              onResetClosures={() =>
                setSimulationState(prev => ({
                  ...prev,
                  closedRoadIds: [],
                  active: prev.simulatedRainfallMm > 0 || prev.simulatedSeaLevelSurgeCm > 0,
                }))
              }
            />
          )}

          {currentSection === 'live' && (
            <LiveEventMonitorView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              liveEvents={liveEvents}
              simulationState={simulationState}
              onUpdateSimulation={updater => setSimulationState(updater)}
              onResetSimulation={handleResetSimulation}
              selectedScenario={selectedScenario}
              selectedYear={selectedYear}
            />
          )}

          {currentSection === 'prioritization' && (
            <ExplainableRiskView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              selectedScenario={selectedScenario}
              selectedYear={selectedYear}
              simulationState={simulationState}
            />
          )}

          {currentSection === 'datasources' && (
            <DataSourcesCoverageView
              regions={COASTAL_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          )}

          {currentSection === 'methodology' && (
            <MethodologyUncertaintyView />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedScenario={selectedScenario}
        onChangeScenario={setSelectedScenario}
        selectedYear={selectedYear}
        onChangeYear={setSelectedYear}
        onResetSimulation={handleResetSimulation}
      />

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedRegion={selectedRegion}
        selectedScenario={selectedScenario}
        selectedYear={selectedYear}
        simulationState={simulationState}
      />
    </div>
  );
}

export default App;
