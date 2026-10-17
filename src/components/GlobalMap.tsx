import React, { useState, useEffect } from 'react';
import { Region, CriticalFacility, RouteResult, SimulationState } from '../types/index.ts';
import { MapLayerState, LeafletFallbackRenderer } from './LeafletFallbackRenderer.tsx';
import { GoogleMapsRenderer } from './GoogleMapsRenderer.tsx';
import { MapPin, Key, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export type { MapLayerState };

interface GlobalMapProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  activeLayers: MapLayerState;
  simulationState?: SimulationState;
  routeResult?: RouteResult | null;
  onSelectFacility?: (facility: CriticalFacility) => void;
  selectedFacilityId?: string;
  heightClassName?: string;
  showAllRegionsMarkers?: boolean;
}

export const GlobalMap: React.FC<GlobalMapProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  activeLayers,
  simulationState,
  routeResult,
  onSelectFacility,
  selectedFacilityId,
  heightClassName = 'h-[540px]',
  showAllRegionsMarkers = true,
}) => {
  // Read API key from Vite environment variable or localStorage override
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pelagix_gmp_key') || envKey;
    }
    return envKey;
  });

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>(() => {
    return apiKey ? 'google' : 'leaflet';
  });

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [authError, setAuthError] = useState(false);

  // Sync apiKey state if envKey or localStorage changes
  useEffect(() => {
    if (apiKey && !authError) {
      setMapEngine('google');
    }
  }, [apiKey, authError]);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    setApiKey(trimmed);
    localStorage.setItem('pelagix_gmp_key', trimmed);
    setAuthError(false);
    setIsKeyModalOpen(false);
    if (trimmed) {
      setMapEngine('google');
    } else {
      setMapEngine('leaflet');
    }
  };

  const handleAuthFailure = () => {
    setAuthError(true);
    setMapEngine('leaflet');
  };

  return (
    <div className={`relative w-full ${heightClassName} rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col`}>
      {/* Top Map Engine Status / Mode Switcher Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 flex flex-wrap items-center justify-between text-xs z-10 backdrop-blur-sm gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full ${
              mapEngine === 'google' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
            }`} />
            <span className="text-slate-400">Map Basemap Engine:</span>
            <span className="font-bold text-slate-200">
              {mapEngine === 'google' 
                ? 'Google Maps JavaScript API (Roadmap / Satellite)' 
                : 'GIS Dark Canvas Basemap'}
            </span>
          </div>

          {authError && (
            <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              API Key Invalid / Unrestricted — Switched to Fallback
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Key Config Button */}
          <button
            onClick={() => {
              setKeyInput(apiKey);
              setIsKeyModalOpen(true);
            }}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors font-mono"
          >
            <Key className="w-3 h-3 text-cyan-400" />
            <span>{apiKey ? 'Manage Google API Key' : 'Configure Google Maps Key'}</span>
          </button>

          {/* Engine Switcher (when key is available) */}
          {apiKey && !authError && (
            <button
              onClick={() => setMapEngine(prev => (prev === 'google' ? 'leaflet' : 'google'))}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 transition-colors font-mono"
            >
              {mapEngine === 'google' ? 'Switch to Fallback Basemap' : 'Switch to Google Maps'}
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner when Google Maps API Key is missing */}
      {!apiKey && (
        <div className="bg-sky-950/70 border-b border-sky-800/60 px-3 py-1.5 flex items-center justify-between text-[11px] text-sky-200 z-10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
            <span>
              <strong>Google Maps API key unconfigured:</strong> Running in offline GIS Basemap mode. All flood hazard, elevation, population, and routing layers are fully active.
            </span>
          </div>
          <button
            onClick={() => {
              setKeyInput(apiKey);
              setIsKeyModalOpen(true);
            }}
            className="text-[10px] underline font-mono text-cyan-300 hover:text-cyan-100 shrink-0 ml-2 cursor-pointer"
          >
            Configure Key →
          </button>
        </div>
      )}

      {/* Notice Banner when Auth Error occurs */}
      {authError && (
        <div className="bg-amber-950/80 border-b border-amber-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-200 z-10">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Google Maps API authorization failed:</strong> Check API key validity, billing status, or HTTP referrer restrictions. Automatically preserved fallback map.
            </span>
          </div>
          <button
            onClick={() => {
              setKeyInput(apiKey);
              setIsKeyModalOpen(true);
            }}
            className="text-[10px] underline font-mono text-amber-300 hover:text-white shrink-0 ml-2 cursor-pointer"
          >
            Update Key →
          </button>
        </div>
      )}

      {/* Primary Map Viewport Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {mapEngine === 'google' && apiKey && !authError ? (
          <GoogleMapsRenderer
            apiKey={apiKey}
            regions={regions}
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            activeLayers={activeLayers}
            simulationState={simulationState}
            routeResult={routeResult}
            onSelectFacility={onSelectFacility}
            selectedFacilityId={selectedFacilityId}
            showAllRegionsMarkers={showAllRegionsMarkers}
            onAuthFailure={handleAuthFailure}
          />
        ) : (
          <LeafletFallbackRenderer
            regions={regions}
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            activeLayers={activeLayers}
            simulationState={simulationState}
            routeResult={routeResult}
            onSelectFacility={onSelectFacility}
            selectedFacilityId={selectedFacilityId}
            showAllRegionsMarkers={showAllRegionsMarkers}
          />
        )}

        {/* Floating Map Symbology Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg text-[10px] text-slate-300 z-10 shadow-lg pointer-events-none space-y-1 max-w-[210px]">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[9px] font-mono border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>Geospatial Symbology</span>
            <span className="text-[8px] text-slate-500 font-normal">PELAGIX v2.4</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
            <span>Full Data / Open Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span>
            <span>Partial Telemetry / Detour</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0"></span>
            <span>Screening / Road Closure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center shrink-0">H</span>
            <span>Mapped Hospital (OSM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-[9px] font-bold text-white flex items-center justify-center shrink-0">S</span>
            <span>Evacuation Shelter (OSM)</span>
          </div>
        </div>
      </div>

      {/* Google Maps API Key Setup Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Google Maps Platform API Key</h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              PELAGIX connects directly to the official <strong>Google Maps JavaScript API</strong> with interactive Roadmap, Satellite, and Terrain modes.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 block">
                API Key (reads from VITE_GOOGLE_MAPS_API_KEY or input below):
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Key is stored securely client-side in localStorage for testing without exposing credentials.
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Google Cloud Recommendations:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Restrict key to HTTP referrers & Maps JavaScript API</li>
                <li>Ensure billing is enabled in Google Cloud Console</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              {apiKey && (
                <button
                  onClick={() => {
                    localStorage.removeItem('pelagix_gmp_key');
                    setApiKey('');
                    setKeyInput('');
                    setMapEngine('leaflet');
                    setIsKeyModalOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Clear Key
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm"
                >
                  Apply & Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
