import React, { useState } from 'react';
import { 
  Waves, 
  Search, 
  Bell, 
  SlidersHorizontal, 
  FileDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Region, LiveEvent } from '../types/index.ts';

interface HeaderProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  liveEvents: LiveEvent[];
  isSimulating: boolean;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  liveEvents,
  isSimulating,
  onOpenSettings,
  onOpenExport,
  onToggleMobileSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredRegions = regions.filter(
    r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
          <Waves className="w-6 h-6 text-cyan-100" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white font-mono">PELAGIX</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono font-semibold">
              Global v2.4
            </span>
            {isSimulating && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold animate-pulse">
                SIMULATION ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 hidden xl:block">
            Climate models forecast sea-level rise — PELAGIX identifies what stops working.
          </p>
        </div>
      </div>

      {/* Global Location Search & Quick Selector */}
      <div className="relative flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coastal cities, deltas, or countries (e.g. Miami, Jakarta, Rotterdam)..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {showSearchDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowSearchDropdown(false)}
            />
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-20 max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 bg-slate-950/60 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Data-Supported Coastal Regions ({filteredRegions.length})
              </div>
              {filteredRegions.map(region => (
                <button
                  key={region.id}
                  onClick={() => {
                    onSelectRegion(region);
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800/80 transition-colors ${
                    selectedRegion.id === region.id ? 'bg-cyan-950/40 text-cyan-300' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-200">{region.name}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5">({region.country})</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    region.dataCoverage === 'full' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : region.dataCoverage === 'partial'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {region.dataCoverage === 'full' ? 'FULL DATA' : region.dataCoverage === 'partial' ? 'PARTIAL' : 'SCREENING ONLY'}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Selected Location Pill & Telemetry Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Selected Region Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 text-[11px]">Active Focus:</span>
          <span className="font-semibold text-slate-200">{selectedRegion.name}</span>
        </div>

        {/* Freshness / Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-cyan-300/90 bg-cyan-950/50 border border-cyan-800/50 px-2.5 py-1 rounded-lg">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Telemetry: Verified 09:30Z</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="System notifications"
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <Bell className="w-4 h-4" />
            {liveEvents.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center font-mono">
                {liveEvents.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      Operational Telemetry Events
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Real-time Feed</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {liveEvents.map(evt => (
                    <div key={evt.id} className="p-3 text-xs hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-200">{evt.title}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          evt.status === 'LIVE' ? 'bg-emerald-950 text-emerald-300' :
                          evt.status === 'SIMULATED' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1 leading-relaxed">{evt.details}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{evt.regionName}</span>
                        <span>{evt.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Export / Report Summary Action */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-sm shadow-cyan-600/20"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Dossier</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
