import React from 'react';
import {
  Zap,
  ShieldCheck,
  Activity,
  Terminal,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  GitCommit
} from 'lucide-react';

interface LandingViewProps {
  onLaunchDemo: () => void;
  onSimulateIncident: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onLaunchDemo,
  onSimulateIncident
}) => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Autonomous SRE Agent</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Detect. Diagnose. Fix <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            API Failures in Seconds.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          TraceMind AI continuously correlates logs, latency percentiles, and deployment events to autonomously isolate the true root cause and generate validated code patches.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm shadow-2xl shadow-cyan-950/60 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-4 h-4 text-cyan-200 fill-cyan-200" />
            <span>Launch Live SRE Agent Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onSimulateIncident}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Simulate Outage Event</span>
          </button>
        </div>
      </div>

      {/* 3-Minute Demo Walkthrough Guide */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1527] to-[#120d20] border border-cyan-900/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-300 uppercase tracking-wide">
            <Clock className="w-4 h-4" />
            <span>3-Minute Live Hackathon Demo Walkthrough</span>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
            Interactive Flow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-xs font-mono font-bold text-rose-400">Step 1: Outage Trigger</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Click <span className="font-bold text-rose-300">Simulate Incident</span> to trigger an 18.7% failure spike on <span className="font-mono text-slate-200">/api/payments</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-xs font-mono font-bold text-cyan-400">Step 2: AI Investigation</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Click <span className="font-bold text-cyan-300">Investigate with AI</span> to watch 3 parallel analyzers scan 1,284 logs & metrics.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-xs font-mono font-bold text-amber-400">Step 3: Root Cause DAG</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              TraceMind isolates <span className="font-bold text-amber-300">HikariCP Pool Exhaustion</span> (93% confidence) via causal DAG.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-xs font-mono font-bold text-emerald-400">Step 4: Auto Code Patch</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inspect the AI-generated configuration diff and click <span className="font-bold text-emerald-300">Generate Fix</span> to resolve.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Parallel Telemetry Correlation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminates alert fatigue by simultaneously investigating structured logs, Prometheus metrics, and GitHub releases.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Transparent "Why?" Reasoning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No black-box hallucinated diagnoses. TraceMind provides a verifiable 5-step proof chain and confidence tier.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Instant Pull Request Ready Patches</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generates exact code and configuration diffs to unblock on-call engineers before customer SLAs are breached.
          </p>
        </div>
      </div>
    </div>
  );
};
