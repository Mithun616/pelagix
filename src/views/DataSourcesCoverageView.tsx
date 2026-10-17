import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { DATA_SOURCE_REGISTRY } from '../data/dataSourceRegistry.ts';
import { DataSourceItem, DataStatus, Region } from '../types/index.ts';
import { GlobalMap, MapLayerState } from '../components/GlobalMap.tsx';

interface DataSourcesCoverageViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (r: Region) => void;
}

export const DataSourcesCoverageView: React.FC<DataSourcesCoverageViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeLayers] = useState<MapLayerState>({
    hazard: true,
    elevationDEM: false,
    population: false,
    facilities: true,
    roads: false,
    tideGauges: true,
    simulation: false,
  });

  const categories = ['all', 'Observations', 'Projections', 'Elevation', 'Population', 'Roads & Infrastructure', 'Precipitation', 'Tides & Water Levels'];

  const filteredSources = DATA_SOURCE_REGISTRY.filter(src => {
    if (filterCategory !== 'all' && src.category !== filterCategory) return false;
    if (searchQuery && !src.name.toLowerCase().includes(searchQuery.toLowerCase()) && !src.provider.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Official Data Source Registry & Global Coverage</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transparency registry of satellite altimetry, climate projection tools, digital surface models, and real-time gauge feeds.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Registry Count: </span>
            <span className="text-cyan-300 font-bold">{DATA_SOURCE_REGISTRY.length} Products</span>
          </div>
        </div>
      </div>

      {/* Global Data Coverage Map showing full vs partial vs screening-only */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Worldwide Regional Data Coverage Tiers</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Honest reporting of coverage gaps: green marks full multi-layer telemetry, amber marks partial feeds, red marks screening-only estimates.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Full Coverage ({regions.filter(r => r.dataCoverage === 'full').length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">Partial ({regions.filter(r => r.dataCoverage === 'partial').length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Screening Only ({regions.filter(r => r.dataCoverage === 'screening_only').length})</span>
            </div>
          </div>
        </div>

        <GlobalMap
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
          activeLayers={activeLayers}
          heightClassName="h-[380px]"
          showAllRegionsMarkers={true}
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-mono uppercase mr-1">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterCategory === cat
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Datasets' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search provider or product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map(source => (
          <div
            key={source.id}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">
                    {source.category}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-0.5">{source.name}</h3>
                  <div className="text-[11px] text-slate-400">{source.provider}</div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold shrink-0 ${
                  source.status === 'LIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  source.status === 'DELAYED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  source.status === 'HISTORICAL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                  source.status === 'PROJECTED' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                  source.status === 'ESTIMATED' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                  'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {source.status}
                </span>
              </div>

              <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Product Used:</span>
                  <span className="font-mono text-slate-300 text-right truncate max-w-56">{source.productUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coverage:</span>
                  <span className="text-slate-300 text-right">{source.coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution:</span>
                  <span className="font-mono text-slate-300">{source.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Update Cadence:</span>
                  <span className="text-slate-300">{source.updateFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Verified Retrieval:</span>
                  <span className="font-mono text-cyan-300">{source.lastRetrievalTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Licensing:</span>
                  <span className="text-slate-400">{source.license}</span>
                </div>
              </div>

              {source.missingDataNotice && (
                <div className="mt-2 p-2 rounded bg-amber-950/30 border border-amber-900/50 text-[10px] text-amber-200/90 leading-tight">
                  <strong>Constraint:</strong> {source.missingDataNotice}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">Units: {source.units}</span>
              <a
                href={source.officialDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
