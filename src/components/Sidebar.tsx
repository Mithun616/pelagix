import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Map, 
  Sliders, 
  Network, 
  Radio, 
  ShieldAlert, 
  Database, 
  BookOpen, 
  HelpCircle,
  AlertOctagon,
  ChevronRight,
  Info
} from 'lucide-react';
import { Region } from '../types/index.ts';

export type NavSection = 
  | 'overview'
  | 'trends'
  | 'map'
  | 'scenarios'
  | 'infrastructure'
  | 'live'
  | 'prioritization'
  | 'datasources'
  | 'methodology';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  selectedRegion: Region;
  isSimulating: boolean;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

interface NavItem {
  id: NavSection;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  selectedRegion,
  isSimulating,
  isOpenMobile,
  onToggleMobile,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Global Overview',
      sublabel: 'Executive posture & ranking',
      icon: LayoutDashboard,
    },
    {
      id: 'trends',
      label: 'Sea-Level Trends',
      sublabel: 'Satellite altimetry vs gauges',
      icon: TrendingUp,
    },
    {
      id: 'map',
      label: 'Coastal Risk Map',
      sublabel: 'Multi-layer spatial analyst',
      icon: Map,
    },
    {
      id: 'scenarios',
      label: 'Scenario Explorer',
      sublabel: 'IPCC AR6 SSP trajectories',
      icon: Sliders,
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure & Access',
      sublabel: 'Network disruption & routing',
      icon: Network,
      badge: isSimulating ? 'Impacted' : undefined,
    },
    {
      id: 'live',
      label: 'Live Event Monitor',
      sublabel: 'Rainfall, tides & simulation',
      icon: Radio,
      badge: isSimulating ? 'Simulating' : 'Real-time',
    },
    {
      id: 'prioritization',
      label: 'Explainable Priority',
      sublabel: 'Transparent weighted scoring',
      icon: ShieldAlert,
    },
    {
      id: 'datasources',
      label: 'Data Sources & Gaps',
      sublabel: 'Registry & coverage map',
      icon: Database,
    },
    {
      id: 'methodology',
      label: 'Methodology & Limits',
      sublabel: 'Scientific rules & caveats',
      icon: BookOpen,
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-72 shrink-0">
      {/* Active Focus Pill */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1.5">
          <span>Active Coastal Basin</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
            selectedRegion.dataCoverage === 'full' 
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' 
              : selectedRegion.dataCoverage === 'partial'
              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
              : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
          }`}>
            {selectedRegion.dataCoverage}
          </span>
        </div>
        <div className="font-semibold text-slate-100 text-sm truncate flex items-center justify-between">
          <span>{selectedRegion.name}</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
          <span>{selectedRegion.country}</span>
          <span>•</span>
          <span className="font-mono">{selectedRegion.coordinates[0].toFixed(2)}°, {selectedRegion.coordinates[1].toFixed(2)}°</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
        <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Intelligence Workspace
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                if (isOpenMobile) onToggleMobile();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/60 text-cyan-200 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <div className="min-w-0">
                  <div className={`text-xs font-medium truncate ${isActive ? 'text-cyan-100' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold shrink-0 ml-1.5 ${
                  item.badge === 'Simulating' || item.badge === 'Impacted'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scientific Integrity & Limitation Notice */}
      <div className="p-3.5 m-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Scientific Notice</span>
        </div>
        <p className="leading-tight text-[10px] text-slate-400">
          Projections utilize published IPCC AR6 models. Elevation alone does not predict hydrodynamic flood depth. Risk scores serve as prioritized decision support.
        </p>
      </div>

      {/* User / Org Session Placeholder */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-cyan-300">
            PX
          </div>
          <div className="truncate">
            <div className="text-slate-200 text-[11px] font-medium leading-tight">Coastal Operations</div>
            <div className="text-[10px] text-slate-500">Regional Planner Mode</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-20">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onToggleMobile} 
          />
          <div className="fixed top-16 left-0 bottom-0 z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
