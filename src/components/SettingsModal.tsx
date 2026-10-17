import React from 'react';
import { X, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import { IPCCScenario, ProjectionYear } from '../types/index.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScenario: IPCCScenario;
  onChangeScenario: (s: IPCCScenario) => void;
  selectedYear: ProjectionYear;
  onChangeYear: (y: ProjectionYear) => void;
  onResetSimulation: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedScenario,
  onChangeScenario,
  selectedYear,
  onChangeYear,
  onResetSimulation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white text-sm">Platform & Modeling Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Default Climate Scenario */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Default IPCC AR6 Pathway:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SSP1-1.9', name: 'SSP1-1.9 (Paris 1.5°C)' },
                { id: 'SSP1-2.6', name: 'SSP1-2.6 (Low Emissions)' },
                { id: 'SSP2-4.5', name: 'SSP2-4.5 (Middle of Road)' },
                { id: 'SSP3-7.0', name: 'SSP3-7.0 (High Emissions)' },
                { id: 'SSP5-8.5', name: 'SSP5-8.5 (Fossil-Fueled)' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => onChangeScenario(item.id as IPCCScenario)}
                  className={`p-2.5 rounded-lg border text-left font-mono transition-colors ${
                    selectedScenario === item.id
                      ? 'bg-cyan-950 border-cyan-700 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs">{item.id}</div>
                  <div className="text-[10px] text-slate-500 font-sans">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Default Horizon */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-slate-300 font-semibold block">Default Decadal Projection Horizon:</label>
            <div className="flex items-center gap-2">
              {([2030, 2050, 2075, 2100] as ProjectionYear[]).map(yr => (
                <button
                  key={yr}
                  onClick={() => onChangeYear(yr)}
                  className={`flex-1 py-2 rounded-lg border font-mono font-medium transition-colors ${
                    selectedYear === yr
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Google Maps Platform API Settings */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-slate-300 font-semibold block">Google Maps Platform Configuration:</label>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-medium">Maps JavaScript API Key</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {typeof window !== 'undefined' && (localStorage.getItem('pelagix_gmp_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
                    ? 'KEY CONFIGURED'
                    : 'NO KEY / FALLBACK'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                When provided, PELAGIX renders the official Google Maps JavaScript API with interactive Roadmap and Satellite basemaps. If omitted, the platform uses the built-in GIS basemap.
              </p>
            </div>
          </div>

          {/* Demonstration State Reset */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-slate-300 font-semibold block">Simulation Sandbox Controls:</label>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-medium">Reset Demonstration State</div>
                <div className="text-[10px] text-slate-500">Clears simulated road closures and surge pulses</div>
              </div>
              <button
                onClick={() => {
                  onResetSimulation();
                  onClose();
                }}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
              >
                Clear Sandbox
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
