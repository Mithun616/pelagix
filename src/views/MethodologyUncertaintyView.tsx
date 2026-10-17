import React from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Network, 
  Compass, 
  Database,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const MethodologyUncertaintyView: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Scientific Methodology, Uncertainty & Limitations</span>
        </h1>
        <p className="text-xs text-slate-400">
          Transparent scientific foundations governing observational satellite altimetry, IPCC AR6 projections, elevation screening, graph routing, and multi-criteria prioritization.
        </p>
      </div>

      {/* Accordion / Content Cards */}
      <div className="space-y-4">
        {/* Section 1: Observations vs Projections */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm uppercase">
            <Compass className="w-4 h-4" />
            <span>1. Historical Observations vs. Climate Model Projections</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              A foundational principle of <strong>PELAGIX</strong> is the strict operational separation between <span className="text-emerald-300 font-semibold">empirical observations</span> and <span className="text-blue-300 font-semibold">future climate projections</span>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>
                <strong className="text-slate-200">Historical Observations (1993–2026):</strong> Derived from multi-mission radar satellite altimetry (TOPEX/Poseidon, Jason-1/2/3, Sentinel-6 Michael Freilich) archived at NASA PO.DAAC, alongside in-situ coastal tide gauge records (NOAA CO-OPS and UNESCO-IOC). These represent actual physical sea surface height measurements.
              </li>
              <li>
                <strong className="text-slate-200">Future Projections (2030–2100):</strong> Ingested directly from the published IPCC Sixth Assessment Report (AR6) Working Group I Sea Level Projection Tool developed by NASA. Projections are conditioned on Shared Socioeconomic Pathways (SSP1-1.9 through SSP5-8.5). They quantify probabilistic confidence intervals (5th, 17th, 50th, 83rd, 95th percentiles) incorporating thermal ocean expansion, glaciers, and Antarctic/Greenland ice sheet dynamics.
              </li>
              <li>
                <strong className="text-amber-300">Non-Extrapolation Rule:</strong> PELAGIX never performs linear regressions on past gauge data to predict future decadal rise. Future sea-level changes are fundamentally non-linear and governed by complex Earth-system feedbacks.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Why Elevation != Exact Flood Depth */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>2. Why Elevation Screening Is Not Local Flood-Depth Prediction</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Users must not interpret elevation values below a projected sea-level rise as guaranteed water depth or inundation. Inundation screening relies on the Copernicus DEM (GLO-30 and GLO-90) digital surface model with the following crucial caveats:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>
                <strong className="text-slate-200">Digital Surface Model (DSM) Bias:</strong> Copernicus DEM measures the reflective top-of-canopy and building roofs, not bare Earth. Low-lying vegetation or urban canyons can falsely appear higher than actual ground level.
              </li>
              <li>
                <strong className="text-slate-200">Engineered Defenses:</strong> Sea walls, dikes (e.g., Dutch Delta Works, Rotterdam Maeslantkering), revetments, levee systems, and stormwater pump stations are sub-pixel features not resolved at 30-meter resolution.
              </li>
              <li>
                <strong className="text-slate-200">Hydrodynamic Flow & Drainage:</strong> Water does not flood land purely like a bathtub. Tidal propagation, hydraulic friction, wave setup, river discharge, and drainage pipe capacity alter coastal water ingress.
              </li>
              <li>
                <strong className="text-slate-200">Vertical Datums:</strong> Global elevation models reference ellipsoids or the EGM2008 geoid, whereas local tides reference Mean Higher High Water (MHHW) or national datums (e.g., NAVD88 in the US, NAP in the Netherlands).
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3: Graph Theory & Emergency Road Accessibility */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm uppercase">
            <Network className="w-4 h-4" />
            <span>3. Graph-Theoretical Road Routing & Accessibility</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              To answer "what may stop working when the ocean rises", PELAGIX models coastal road networks as a mathematical graph <span className="font-mono text-cyan-300">G = (V, E)</span>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>
                <strong className="text-slate-200">Nodes (V):</strong> Represent road intersections, highway ramps, bridge abutments, and community centroids, with associated coordinates and topographical elevations.
              </li>
              <li>
                <strong className="text-slate-200">Edges (E):</strong> Represent navigable road segments tagged with length (km) and classification (primary arterial, coastal causeway, secondary corridor).
              </li>
              <li>
                <strong className="text-slate-200">Dijkstra Shortest Path:</strong> The routing engine computes the optimal traversal path between emergency origin centers and critical facilities (trauma hospitals, evacuation shelters).
              </li>
              <li>
                <strong className="text-slate-200">Dynamic Blockage Propagation:</strong> When coastal causeways or low segments are severed—either by operational disruption or user simulation—the algorithm reroutes across surviving inland corridors or reports complete facility isolation.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4: Explainable Multi-Criteria Priority Formula */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold font-mono text-sm uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>4. Explainable Multi-Criteria Priority Formulation</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              The composite Priority Score (0–100) is calculated via normalized multi-criteria decision analysis (MCDA):
            </p>
            <div className="p-3 bg-slate-950 font-mono text-cyan-300 text-xs rounded-lg border border-slate-800 text-center">
              Priority Score = (w_exp × Exposure) + (w_pop × Population) + (w_acc × Access Risk)
            </div>
            <p>
              Default baseline weights are assigned as:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong className="text-slate-200">w_exp = 0.40 (Exposure):</strong> Projected sea-level rise magnitude + percentage of terrain lying in the sub-2m coastal zone.</li>
              <li><strong className="text-slate-200">w_pop = 0.30 (Population Vulnerability):</strong> Normalized WorldPop count of inhabitants residing in contiguous low-elevation zones.</li>
              <li><strong className="text-slate-200">w_acc = 0.30 (Access Risk):</strong> Proportion of critical facilities in flood-prone nodes + ratio of severed road segments to total regional network edges.</li>
            </ul>
            <p className="text-[11px] text-slate-400">
              Weights can be adjusted by planners during stress-testing, but are always automatically re-normalized to sum to 100%. Data confidence is tracked independently and drops when datasets are absent.
            </p>
          </div>
        </div>

        {/* Section 5: Coverage Gaps & Honest Reporting */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold font-mono text-sm uppercase">
            <Database className="w-4 h-4" />
            <span>5. Global Coverage Gaps & Scientific Integrity</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Global geospatial data is uneven. Rather than inventing artificial metrics or fabricating synthetic API feeds:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>
                <strong className="text-slate-200">Screening-Only Coastlines:</strong> Regions lacking validated high-resolution road topology, local tide telemetry, or sub-meter elevation (e.g. Dakar, Chittagong) are flagged as <span className="text-rose-300 font-mono">SCREENING ONLY</span>, and numerical priority rankings are withheld.
              </li>
              <li>
                <strong className="text-slate-200">Transparent Latency:</strong> Observational feeds (such as NASA GPM IMERG Late Run) explicitly report their 3–14 hour processing latency rather than claiming instantaneous real-time capability.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
