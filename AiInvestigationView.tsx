import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GitCommit,
  Database,
  Cpu,
  Layers,
  Code,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  Terminal,
  Filter,
  Check
} from 'lucide-react';
import {
  AIInvestigationReport,
  AgentInvestigationStep,
  FingerprintCluster,
  RecommendedFixAction,
  LogEntry
} from '../types';
import { apiClient } from '../services/apiClient';

interface AiInvestigationViewProps {
  report: AIInvestigationReport;
  isInvestigating: boolean;
  onRerunInvestigation: () => void;
  onNavigateToLogs: (category?: string) => void;
  onNavigateToReport: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, msg: string) => void;
}

export const AiInvestigationView: React.FC<AiInvestigationViewProps> = ({
  report,
  isInvestigating,
  onRerunInvestigation,
  onNavigateToLogs,
  onNavigateToReport,
  onShowToast
}) => {
  const [selectedFingerprint, setSelectedFingerprint] = useState<string | null>(null);
  const [selectedFix, setSelectedFix] = useState<RecommendedFixAction | null>(null);
  const [isGeneratingFix, setIsGeneratingFix] = useState(false);
  const [generatedPatch, setGeneratedPatch] = useState<any>(null);
  const [activeWorkerTab, setActiveWorkerTab] = useState<'all' | 'logs' | 'metrics' | 'deployments'>('all');
  const [copiedPatch, setCopiedPatch] = useState(false);

  // Default selected fix
  useEffect(() => {
    if (report.recommendations && report.recommendations.length > 0 && !selectedFix) {
      setSelectedFix(report.recommendations[1]); // DB pool fix
    }
  }, [report, selectedFix]);

  const handleGenerateFix = async (rec: RecommendedFixAction) => {
    setSelectedFix(rec);
    setIsGeneratingFix(true);
    try {
      const res = await apiClient.generateCodeFix(rec.id, rec.actionType, 'payment-service');
      setGeneratedPatch(res.patch || rec.suggestedPatch);
      onShowToast('success', 'AI Patch Synthesized', `Generated fix for: ${rec.title}`);
    } catch (e) {
      setGeneratedPatch(rec.suggestedPatch);
    } finally {
      setIsGeneratingFix(false);
    }
  };

  const handleCopyPatch = () => {
    if (generatedPatch?.codeAfter || selectedFix?.suggestedPatch?.codeAfter) {
      const code = generatedPatch?.codeAfter || selectedFix?.suggestedPatch?.codeAfter;
      navigator.clipboard.writeText(code);
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
      onShowToast('success', 'Copied to Clipboard', 'Code patch copied successfully.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1626] to-[#0b101c] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Autonomous AI Investigation Suite
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  Gemini 3.7 Reasoning Core
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Parallel log, metric & deployment analyzers correlated 1,284 failure events.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Incident Report</span>
          </button>
          <button
            onClick={onRerunInvestigation}
            disabled={isInvestigating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInvestigating ? 'animate-spin' : ''}`} />
            <span>{isInvestigating ? 'Re-analyzing Telemetry...' : 'Re-run Agent Investigation'}</span>
          </button>
        </div>
      </div>

      {/* 1. Live AI Investigation Stepper Panel */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              AI Investigation Workflow & Activity Timeline
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>9/9 Investigation Tasks Finished</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {report.investigationSteps.map((step, index) => (
            <div
              key={step.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3"
            >
              <div className="mt-0.5 shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-200 line-clamp-1">{step.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                    {step.durationMs}ms
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                    {step.worker}
                  </span>
                </div>
                {step.findings && (
                  <p className="text-[11px] text-slate-400 leading-snug">{step.findings}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Parallel Investigation 3-Worker Telemetry */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Parallel Investigation Workers
            </h3>
          </div>
          <span className="text-xs text-slate-400">Independent analytical pipelines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Log Analyzer */}
          <div className="p-5 rounded-2xl bg-[#0B0F19] border border-cyan-900/40 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wide">
                <Terminal className="w-4 h-4" />
                <span>Log Analyzer</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                743 Timeouts
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Recurring Patterns: </span>
                <span className="text-rose-400 font-mono">
                  HikariPool-1 connection acquisition timeout
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
                {report.parallelFindings.logAnalyzer.stackTraceSnippet}
              </div>
              <div className="text-slate-400 text-[11px]">
                Distribution: {report.parallelFindings.logAnalyzer.topErrorRate}
              </div>
            </div>
          </div>

          {/* Metrics Analyzer */}
          <div className="p-5 rounded-2xl bg-[#0B0F19] border border-amber-900/40 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wide">
                <Activity className="w-4 h-4" />
                <span>Metrics Analyzer</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
                100% Saturation
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Latency Spike: </span>
                <span className="text-amber-300">
                  {report.parallelFindings.metricsAnalyzer.latencySpike}
                </span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Error Surge: </span>
                <span className="text-rose-400">
                  {report.parallelFindings.metricsAnalyzer.errorSpike}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200">
                {report.parallelFindings.metricsAnalyzer.saturationPoint}
              </div>
            </div>
          </div>

          {/* Deployment Analyzer */}
          <div className="p-5 rounded-2xl bg-[#0B0F19] border border-indigo-900/40 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wide">
                <GitCommit className="w-4 h-4" />
                <span>Deployment Analyzer</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
                T - 4 min
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Release: </span>
                <span className="text-indigo-300 font-mono">
                  {report.parallelFindings.deploymentAnalyzer.latestRelease}
                </span>
              </div>
              <div className="text-slate-300 text-[11px]">
                {report.parallelFindings.deploymentAnalyzer.timeDelta}
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                {report.parallelFindings.deploymentAnalyzer.flaggedChanges.map((ch, idx) => (
                  <li key={idx} className="line-clamp-1">
                    {ch}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Evidence Correlation Engine DAG Graph */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Evidence Correlation Engine — Causal Chain DAG</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-dimensional causality mapping from commit rollout to customer-facing 500 errors
            </p>
          </div>
        </div>

        {/* Visual DAG Node Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {report.evidenceChain.map((node, index) => (
            <div key={node.id} className="relative flex flex-col">
              <div
                className={`p-4 rounded-xl border transition-all h-full flex flex-col justify-between ${
                  node.type === 'deployment'
                    ? 'bg-indigo-950/40 border-indigo-700/50 text-indigo-200'
                    : node.type === 'metric'
                    ? 'bg-amber-950/40 border-amber-700/50 text-amber-200'
                    : node.type === 'log'
                    ? 'bg-rose-950/40 border-rose-700/50 text-rose-200'
                    : 'bg-rose-950/80 border-rose-600/70 text-rose-100 ring-2 ring-rose-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                      {node.stepNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-black/40 border border-white/10">
                      {node.statBadge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold leading-tight mb-1 text-white">{node.title}</h4>
                  <p className="text-[11px] opacity-80 leading-snug">{node.subtitle}</p>
                </div>
              </div>

              {/* Arrow Connector for Desktop */}
              {index < report.evidenceChain.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Root Cause Analysis Card with 93% Confidence */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0A0E1A] border-2 border-cyan-500/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Primary Diagnostic Assessment
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{report.rootCause}</span>
            </h2>
          </div>

          {/* High Confidence Badge */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-950 to-cyan-950 border border-emerald-500/50 text-emerald-300 flex items-center gap-2.5 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-black tracking-wide uppercase">
                  {report.confidence}% {report.confidenceTier}
                </div>
                <div className="text-[10px] text-emerald-400/80">
                  Deterministic Causal Proof
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Likely Trigger & Evidence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Likely Trigger */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Likely Root Cause Trigger</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">{report.likelyTrigger}</p>
          </div>

          {/* Supporting Evidence Chain */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Evidence Points</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {report.evidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="leading-snug">{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5. "Why?" Explainability Section */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Why This Root Cause? (Explainability & Reasoning)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent, auditable rationale eliminating false positives and external dependency failures
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
            Confidence: {report.confidence}%
          </span>
        </div>

        <div className="space-y-2.5">
          {report.whyExplanation.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200"
            >
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                {index + 1}
              </span>
              <p className="leading-relaxed mt-0.5">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Failure Fingerprinting (Click-to-Filter) */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              <span>Failure Fingerprinting (1,284 Sampled API Errors)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click a fingerprint category to inspect filtered error logs & stack traces
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {report.fingerprints.map(cluster => (
            <button
              key={cluster.category}
              onClick={() => onNavigateToLogs(cluster.category)}
              className={`p-4 rounded-xl border text-left transition-all group ${
                selectedFingerprint === cluster.category
                  ? 'bg-cyan-950/80 border-cyan-500 ring-2 ring-cyan-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cluster.color }}
                />
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {cluster.count} errors
                </span>
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {cluster.category}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                {cluster.description}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>{cluster.percentage}% of total</span>
                <span className="text-cyan-400 flex items-center gap-0.5 font-semibold group-hover:underline">
                  View Logs <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Recommended Fixes & Fix Generator */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Recommended Actionable Fixes</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritized mitigation steps and automated code/configuration patch generator
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fix Action Cards */}
          <div className="space-y-3">
            {report.recommendations.map(rec => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all ${
                  selectedFix?.id === rec.id
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-[10px] font-mono">
                      {rec.priority}
                    </span>
                    <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      rec.risk === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : rec.risk === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Risk: {rec.risk}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{rec.description}</p>
                <div className="text-[11px] text-slate-400 mt-2">
                  <span className="font-semibold text-slate-400">Impact: </span>
                  <span className="text-emerald-400">{rec.expectedImpact}</span>
                </div>

                {/* Generate Fix Button */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Type: {rec.actionType.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleGenerateFix(rec)}
                    disabled={isGeneratingFix}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-colors disabled:opacity-50"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{selectedFix?.id === rec.id && isGeneratingFix ? 'Synthesizing...' : 'Generate Fix'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Code Patch Viewer */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    {generatedPatch?.filename || selectedFix?.suggestedPatch?.filename || 'config/database.yaml'}
                  </span>
                </div>
                <button
                  onClick={handleCopyPatch}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
                >
                  {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPatch ? 'Copied!' : 'Copy Patch'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3 leading-snug">
                {generatedPatch?.explanation ||
                  selectedFix?.suggestedPatch?.explanation ||
                  'Expands HikariCP connection pool capacity and implements fail-fast acquisition timeouts.'}
              </p>

              {/* Code Diff Display */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase text-rose-400">
                  - Before (Vulnerable Code / Config):
                </div>
                <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-[11px] font-mono text-rose-200 overflow-x-auto whitespace-pre leading-relaxed">
                  {generatedPatch?.codeBefore ||
                    selectedFix?.suggestedPatch?.codeBefore ||
                    `# Default pool limit is too low for audit queries
datasource:
  hikari:
    maximum-pool-size: 20
    connection-timeout: 30000`}
                </pre>

                <div className="text-[10px] font-mono font-bold uppercase text-emerald-400 pt-2">
                  + After (AI Recommended Patch):
                </div>
                <pre className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-[11px] font-mono text-emerald-200 overflow-x-auto whitespace-pre leading-relaxed">
                  {generatedPatch?.codeAfter ||
                    selectedFix?.suggestedPatch?.codeAfter ||
                    `# Optimized pool configuration with fail-fast timeout
datasource:
  hikari:
    maximum-pool-size: 60
    minimum-idle: 15
    connection-timeout: 5000
    idle-timeout: 600000`}
                </pre>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 flex items-center justify-between">
              <span>Ready for CI/CD Pull Request</span>
              <span className="font-mono font-bold">git checkout -b fix/db-pool-limits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
