import React, { useState } from 'react';
import {
  GitCommit,
  GitBranch,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Tag,
  ArrowRight
} from 'lucide-react';
import { DeploymentEvent } from '../types';

interface DeploymentsViewProps {
  deployments: DeploymentEvent[];
  onInvestigateIncident?: () => void;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({
  deployments,
  onInvestigateIncident
}) => {
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentEvent>(deployments[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>Deployment & Release History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of container releases, config flags, and autonomous incident correlation
          </p>
        </div>
      </div>

      {/* Main Grid: Deployment List & Diff Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Deployment List */}
        <div className="space-y-3">
          {deployments.map(dep => {
            const isSelected = selectedDeployment.id === dep.id;
            return (
              <div
                key={dep.id}
                onClick={() => setSelectedDeployment(dep)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/20'
                    : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {dep.version}
                    </span>
                    {dep.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Current Release
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{dep.timeAgo}</span>
                </div>

                <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                  {dep.commitMessage}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{dep.service}</span>
                  <span className="font-mono text-[10px] text-slate-500">{dep.commitHash}</span>
                </div>

                {dep.incidentCorrelation && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-800/50 text-[11px] font-bold text-rose-300 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{dep.incidentCorrelation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Diff & Correlation View */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white font-mono">{selectedDeployment.version}</span>
                <span className="text-xs font-mono text-slate-400">({selectedDeployment.commitHash})</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {selectedDeployment.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {selectedDeployment.timestamp}
                </span>
              </div>
            </div>

            {selectedDeployment.incidentCorrelation && (
              <span className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-700 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Triggered Active Incident</span>
              </span>
            )}
          </div>

          {/* Commit Message */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Commit Message:
            </div>
            <p className="text-xs font-mono text-slate-200">{selectedDeployment.commitMessage}</p>
          </div>

          {/* Configuration & Environment Diffs */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Configuration & Parameter Diffs
            </div>

            <div className="divide-y divide-slate-800 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              {selectedDeployment.configChanges.map((change, i) => (
                <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-cyan-300">{change.key}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-rose-400 line-through bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/30">
                      {change.oldValue}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                      {change.newValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Causal Finding */}
          {selectedDeployment.incidentCorrelation && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900 border border-rose-600/40 space-y-2">
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>AI Correlation Insight</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Release <span className="font-mono text-white">v2.4.1</span> introduced eager synchronous audit writes, spiking database queries per transaction from 2 to 7. Because <span className="font-mono text-white">DB_POOL_MAX_SIZE</span> was left at 20, the pool saturated within 4 minutes under standard 480 RPS load.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
