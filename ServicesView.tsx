import React from 'react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Microservice } from '../types';

interface ServicesViewProps {
  services: Microservice[];
  onInvestigate?: (serviceId: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ services, onInvestigate }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Microservice Mesh & API Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time topology, health scores, latency percentiles, and dependency mapping
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(svc => (
          <div
            key={svc.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              svc.status === 'critical'
                ? 'bg-gradient-to-b from-rose-950/40 to-[#0B0F19] border-rose-600/50 shadow-xl shadow-rose-950/20'
                : svc.status === 'degraded'
                ? 'bg-gradient-to-b from-amber-950/30 to-[#0B0F19] border-amber-600/40'
                : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              {/* Top Row: Name & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        svc.status === 'critical'
                          ? 'bg-rose-500 animate-pulse'
                          : svc.status === 'degraded'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <h3 className="text-base font-bold text-white">{svc.name}</h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold mt-0.5 block">
                    {svc.endpoint}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    svc.status === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : svc.status === 'degraded'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {svc.status === 'critical' && '🔴 Critical'}
                  {svc.status === 'degraded' && '🟡 Degraded'}
                  {svc.status === 'healthy' && '🟢 Healthy'}
                </span>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Health</div>
                  <div
                    className={`text-sm font-mono font-bold ${
                      svc.healthScore < 60
                        ? 'text-rose-400'
                        : svc.healthScore < 90
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {svc.healthScore}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Latency</div>
                  <div className="text-sm font-mono font-bold text-slate-200">
                    {svc.latencyMs}ms
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Error Rate</div>
                  <div
                    className={`text-sm font-mono font-bold ${
                      svc.errorRate > 5 ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {svc.errorRate}%
                  </div>
                </div>
              </div>

              {/* Dependencies */}
              <div className="space-y-1 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Dependencies:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {svc.dependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Release {svc.lastDeployedVersion}</span>
              <span>Uptime: {svc.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
