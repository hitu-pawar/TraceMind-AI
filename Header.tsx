import React from 'react';
import {
  Activity,
  Flame,
  CheckCircle2,
  RefreshCw,
  Zap,
  Play,
  RotateCcw,
  BookOpen,
  Layers,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  isIncidentActive: boolean;
  onSimulateIncident: () => void;
  onResetIncident: () => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
  isInvestigating: boolean;
  onStartInvestigation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isIncidentActive,
  onSimulateIncident,
  onResetIncident,
  onNavigate,
  activeTab,
  isInvestigating,
  onStartInvestigation
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B0F19]/90 border-b border-slate-800/80 backdrop-blur-md px-4 lg:px-6 py-3 flex items-center justify-between transition-colors">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-cyan-950/40 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">TraceMind AI</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                SRE Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Detect. Diagnose. Fix API Failures.
            </p>
          </div>
        </button>

        {/* Global Live Status Pill */}
        <div className="hidden md:flex items-center ml-2">
          {isIncidentActive ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-600/50 text-rose-300 text-xs font-semibold shadow-inner shadow-rose-900/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>1 Incident Active: POST /api/payments</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>● System Operational</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Navigation Quick Switch */}
        <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs font-medium text-slate-300">
          <button
            onClick={() => onNavigate('overview')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white font-semibold shadow'
                : 'hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('investigations')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeTab === 'investigations'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 font-semibold shadow'
                : 'hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Agent</span>
            {isIncidentActive && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => onNavigate('architecture')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-white font-semibold shadow'
                : 'hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture</span>
          </button>
        </div>

        {/* Demo Action Buttons */}
        {isIncidentActive ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onStartInvestigation}
              disabled={isInvestigating}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-cyan-200 ${isInvestigating ? 'animate-spin' : ''}`} />
              <span>{isInvestigating ? 'Investigating...' : 'Investigate with AI'}</span>
            </button>
            <button
              onClick={onResetIncident}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Reset System to 100% Operational"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset System</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateIncident}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Flame className="w-3.5 h-3.5 text-rose-200 animate-pulse" />
              <span>Simulate Incident</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
