import React from 'react';
import {
  Layers,
  ScrollText,
  Activity,
  GitCommit,
  Cpu,
  Sparkles,
  Zap,
  ShieldCheck,
  Code,
  ArrowDown,
  ArrowRight,
  Database
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              TraceMind AI System Architecture
            </h1>
            <p className="text-xs text-slate-400">
              End-to-end autonomous pipeline from raw telemetry ingestion to causal synthesis and automated patch generation
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="p-8 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl space-y-8">
        {/* Layer 1: Ingestion Sources */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-mono text-[10px]">1</span>
            <span>Multi-Modal Telemetry Stream Ingestion</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
                <ScrollText className="w-4 h-4" />
                <span>API Structured Logs</span>
              </div>
              <p className="text-xs text-slate-400">
                1,284 RPS JSON log stream with stack traces, HTTP status codes, and trace context.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                <Activity className="w-4 h-4" />
                <span>1-Second Metrics</span>
              </div>
              <p className="text-xs text-slate-400">
                P50/P95/P99 latency percentiles, error budget burn rates, and pool saturation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
                <GitCommit className="w-4 h-4" />
                <span>Deployment Webhooks</span>
              </div>
              <p className="text-xs text-slate-400">
                CI/CD release metadata, commit diffs, and container configuration flags.
              </p>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 2: Anomaly Detection Engine */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-mono text-[10px]">2</span>
            <span>Real-time Anomaly Detection</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Dynamic SLO Thresholding & Drift Monitoring</h4>
              <p className="text-xs text-slate-400">
                Triggers incident workflow when error budget burns &gt;5% in 5m window or P95 latency drifts &gt;300%.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-xs font-mono font-bold shrink-0">
              18.7% Error Spike Detected
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 3: Autonomous AI Agent & Parallel Analyzers */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center justify-center font-mono text-[10px]">3</span>
            <span>TraceMind Autonomous AI Agent (Parallel Analyzers)</span>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span>Parallel Sub-Agent Dispatch</span>
              <span className="font-mono text-emerald-400">Concurrent Execution</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-cyan-300">Log Analyzer</div>
                <div className="text-[11px] text-slate-400">
                  Fingerprints 743 database timeout errors and parses stack traces in PaymentLedgerRepository.
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-amber-300">Metrics Analyzer</div>
                <div className="text-[11px] text-slate-400">
                  Identifies 100% pool saturation (20/20 active conns) coinciding with latency spike.
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-indigo-300">Deployment Analyzer</div>
                <div className="text-[11px] text-slate-400">
                  Correlates v2.4.1 release (4 min prior) adding synchronous ledger audit queries.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 4: Evidence Correlation Engine */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-mono text-[10px]">4</span>
            <span>Causal Evidence Correlation & Confidence Scoring</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs text-slate-300 leading-relaxed font-mono">
              [Deployment v2.4.1] ➔ [Queries +31%] ➔ [Pool 100%] ➔ [Timeouts ↑11x] ➔ [HTTP 500 ↑18.7%]
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Deterministic Confidence Assessment:</span>
              <span className="font-bold text-emerald-400">93% High Confidence Score</span>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 5: Fix Recommendations & Code Patch */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center justify-center font-mono text-[10px]">5</span>
            <span>Remediation & Automated Patch Synthesis</span>
          </div>

          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Actionable Debugging & Code Patch Generation</h4>
              <p className="text-xs text-slate-300">
                Produces ready-to-merge configuration changes (HikariCP pool limit: 20 ➔ 60) and async queue worker refactor.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow shrink-0">
              PR Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
