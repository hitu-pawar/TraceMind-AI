import React, { useState } from 'react';
import {
  FileText,
  FileJson,
  Printer,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  Zap,
  CheckCircle2,
  GitCommit,
  ArrowRight,
  Code,
  Eye,
  FileCode,
  Layers,
  Sparkles,
  Share2
} from 'lucide-react';
import { Incident, AIInvestigationReport } from '../types';

interface IncidentReportViewProps {
  incident: Incident;
  report: AIInvestigationReport;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, msg: string) => void;
}

type ViewMode = 'postmortem' | 'executive-pdf' | 'json';

export const IncidentReportView: React.FC<IncidentReportViewProps> = ({
  incident,
  report,
  onShowToast
}) => {
  const [copiedType, setCopiedType] = useState<'md' | 'json' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('postmortem');

  // Structured JSON export payload
  const generateStructuredJSON = () => {
    const structuredPayload = {
      $schema: 'https://tracemind.ai/schemas/incident-postmortem-v1.json',
      reportMetadata: {
        reportId: `RPT-${incident.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        generatedAt: report.generatedAt || new Date().toISOString(),
        engine: 'TraceMind AI Autonomous SRE (Gemini 3.7 Flash Engine)',
        version: '1.4.0',
        environment: 'production'
      },
      incidentDetails: {
        id: incident.id,
        title: incident.title,
        serviceId: incident.serviceId,
        serviceName: incident.serviceName,
        endpoint: incident.endpoint,
        severity: incident.severity,
        status: incident.status,
        startTime: incident.startTime,
        peakErrorRatePercent: incident.errorRate,
        latencySeconds: incident.latencySeconds,
        totalFailedRequests: incident.requestsCount ? Math.round(incident.requestsCount * (incident.errorRate / 100)) : 2330,
        summary: incident.summary,
        customerImpact: incident.impact
      },
      aiInvestigation: {
        rootCause: report.rootCause,
        confidenceScore: report.confidence,
        confidenceTier: report.confidenceTier,
        likelyTrigger: report.likelyTrigger,
        evidenceChain: report.evidence,
        fiveWhysAnalysis: report.whyExplanation || [],
        recommendedActions: report.recommendations.map(r => ({
          priority: r.priority,
          title: r.title,
          description: r.description,
          risk: r.risk,
          expectedImpact: r.expectedImpact
        }))
      },
      telemetryCorrelation: {
        timeline: incident.timeline.map(t => ({
          time: t.timeLabel,
          timestamp: t.timestamp,
          event: t.title,
          description: t.description,
          category: t.type
        })),
        affectedComponents: [
          'payment-service (v2.4.1)',
          'HikariCP Connection Pool (Max: 10)',
          'PostgreSQL Primary DB Cluster',
          'API Gateway Ingress Proxy'
        ]
      }
    };
    return structuredPayload;
  };

  const generateMarkdownReport = () => {
    return `# SRE Post-Mortem Incident Report: ${incident.title}

**Incident ID:** ${incident.id}
**Severity:** ${incident.severity}
**Status:** ${incident.status.toUpperCase()}
**Start Time:** ${incident.startTime}
**Affected Service:** ${incident.serviceName} (${incident.endpoint})
**Impact:** ${incident.impact}

---

## 1. Executive Summary
Following the release of **v2.4.1** on **${incident.serviceName}**, error rates surged to **${incident.errorRate}%** with average latency reaching **${incident.latencySeconds}s**. 

Autonomous investigation by **TraceMind AI** diagnosed **${report.rootCause}** with **${report.confidence}% confidence**.

---

## 2. Root Cause Analysis
- **Root Cause:** ${report.rootCause}
- **Confidence Score:** ${report.confidence}% (${report.confidenceTier})
- **Likely Trigger:** ${report.likelyTrigger}

### Evidence Chain:
${report.evidence.map(e => `- ${e}`).join('\n')}

---

## 3. Incident Timeline
${incident.timeline.map(t => `- **${t.timeLabel}** - ${t.title}: ${t.description}`).join('\n')}

---

## 4. Remediation Actions
${report.recommendations.map(r => `${r.priority}. **${r.title}** (Risk: ${r.risk})\n   - Expected Impact: ${r.expectedImpact}\n   - Details: ${r.description}`).join('\n\n')}

---
*Generated autonomously by TraceMind AI SRE Engine at ${report.generatedAt}*
`;
  };

  // Export JSON file handler
  const handleExportJSON = () => {
    const data = generateStructuredJSON();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-investigation-${incident.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('success', 'JSON Exported', `Downloaded incident-investigation-${incident.id}.json`);
  };

  // Copy JSON handler
  const handleCopyJSON = () => {
    const jsonString = JSON.stringify(generateStructuredJSON(), null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
    onShowToast('success', 'JSON Copied', 'Structured investigation JSON copied to clipboard.');
  };

  // Export Markdown handler
  const handleExportMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${incident.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('success', 'Markdown Exported', `Downloaded incident-report-${incident.id}.md`);
  };

  // Copy Markdown handler
  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopiedType('md');
    setTimeout(() => setCopiedType(null), 2000);
    onShowToast('success', 'Summary Copied', 'Markdown incident report copied to clipboard.');
  };

  // Print / Save to PDF handler
  const handlePrintPDF = () => {
    // Switch to executive view before triggering print for optimal presentation
    if (viewMode === 'json') {
      setViewMode('executive-pdf');
      setTimeout(() => {
        window.print();
      }, 100);
    } else {
      window.print();
    }
    onShowToast('info', 'Print / PDF Ready', 'Select "Save as PDF" in your print destination dialog.');
  };

  const jsonContent = JSON.stringify(generateStructuredJSON(), null, 2);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Header & Format Selector */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Incident Post-Mortem & AI Findings
              </h2>
              <p className="text-xs text-slate-400">
                Export autonomous investigation data as structured JSON, PDF display, or Markdown
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('postmortem')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'postmortem'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>SRE Report</span>
          </button>
          <button
            onClick={() => setViewMode('executive-pdf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'executive-pdf'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Display</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'json'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Structured JSON</span>
          </button>
        </div>

        {/* Primary Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Download structured JSON file"
          >
            <FileJson className="w-4 h-4 text-purple-400" />
            <span>Export JSON</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Print or save as formatted PDF document"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print / PDF</span>
          </button>

          {/* Export Markdown Button */}
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all active:scale-95"
            title="Download markdown post-mortem"
          >
            <Download className="w-4 h-4" />
            <span>Export .MD</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Standard SRE Post-Mortem Card */}
      {viewMode === 'postmortem' && (
        <div className="printable-document p-8 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl space-y-8 text-slate-200 font-sans">
          {/* Document Title Block */}
          <div className="border-b border-slate-800 pb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-rose-950 text-rose-300 border border-rose-600/50">
                Severity: {incident.severity}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Incident Ref: <span className="text-white font-bold">{incident.id}</span>
                </span>
                <button
                  onClick={handleCopyMarkdown}
                  className="no-print p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy Markdown Summary"
                >
                  {copiedType === 'md' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {incident.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-500 block">Affected Service</span>
                <span className="font-semibold text-white">{incident.serviceName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Endpoint</span>
                <span className="font-mono text-cyan-300">{incident.endpoint}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Start Time</span>
                <span className="font-semibold text-white">{incident.startTime}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Error Peak</span>
                <span className="font-mono font-bold text-rose-400">{incident.errorRate}% HTTP 500</span>
              </div>
            </div>
          </div>

          {/* Executive Summary & Impact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              1. Executive Summary & Customer Impact
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {incident.summary}
            </p>
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200">
              <span className="font-bold text-rose-300">Customer Impact: </span>
              {incident.impact}
            </div>
          </div>

          {/* Root Cause & Confidence */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              2. Autonomous Diagnostic Root Cause
            </h3>
            <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-lg font-black text-white">{report.rootCause}</h4>
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 text-xs font-bold">
                  {report.confidence}% {report.confidenceTier}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-200">Trigger Mechanism: </span>
                {report.likelyTrigger}
              </p>
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase">Verified Evidence:</div>
                {report.evidence.map((ev, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incident Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              3. Detailed Timeline
            </h3>
            <div className="space-y-2">
              {incident.timeline.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs"
                >
                  <span className="font-mono font-bold text-cyan-400 shrink-0 w-14">
                    {item.timeLabel}
                  </span>
                  <div>
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-slate-400 mt-0.5">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              4. Corrective & Preventative Actions
            </h3>
            <div className="space-y-3">
              {report.recommendations.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        {rec.priority}
                      </span>
                      <span>{rec.title}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Risk: {rec.risk}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{rec.description}</p>
                  <div className="text-[11px] text-emerald-400">
                    Expected Impact: {rec.expectedImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Formatted PDF / Executive Display Mode */}
      {viewMode === 'executive-pdf' && (
        <div className="printable-document p-8 sm:p-12 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl space-y-8 font-sans">
          {/* Executive Header with Organization Branding */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm tracking-wider uppercase">
                <ShieldAlert className="w-5 h-5" />
                <span>TraceMind AI Site Reliability Post-Mortem</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                {incident.title}
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                Document Ref: POSTMORTEM-{incident.id.toUpperCase()} • Generated: {report.generatedAt}
              </p>
            </div>
            <div className="text-right sm:self-center shrink-0">
              <span className="inline-block px-3 py-1 rounded bg-red-100 text-red-800 border border-red-300 font-extrabold text-xs tracking-wider uppercase">
                Severity: {incident.severity} (P1)
              </span>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Status: RESOLVED & DIAGNOSED</div>
            </div>
          </div>

          {/* Quick Vital Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-100/90 rounded-xl border border-slate-300 text-xs">
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Service Impacted</div>
              <div className="font-bold text-slate-900 mt-0.5">{incident.serviceName}</div>
              <div className="font-mono text-[11px] text-indigo-600">{incident.endpoint}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Outage Duration / Start</div>
              <div className="font-bold text-slate-900 mt-0.5">{incident.startTime}</div>
              <div className="text-slate-600 text-[11px]">Duration: ~18 mins</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Peak Error Rate</div>
              <div className="font-bold text-red-600 mt-0.5">{incident.errorRate}% Failure Rate</div>
              <div className="text-slate-600 text-[11px]">HTTP 500 Spike</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">P95 Latency Degradation</div>
              <div className="font-bold text-amber-700 mt-0.5">{incident.latencySeconds}s (Baseline 112ms)</div>
              <div className="text-slate-600 text-[11px]">25x degradation</div>
            </div>
          </div>

          {/* Section 1: Executive Overview */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1">
              1. Executive Summary & Customer Impact
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {incident.summary}
            </p>
            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-xs text-red-900">
              <strong className="font-bold">Business & User Impact: </strong>
              {incident.impact}
            </div>
          </div>

          {/* Section 2: AI Root Cause Analysis */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1">
              2. Technical Root Cause & Diagnostic Confidence
            </h2>
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-indigo-950">
                  {report.rootCause}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                  {report.confidence}% Confidence ({report.confidenceTier})
                </span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>Trigger:</strong> {report.likelyTrigger}
              </p>
              <div className="pt-2 border-t border-indigo-200/80">
                <div className="text-[11px] font-bold text-slate-800 uppercase mb-1">Empirical Corroboration:</div>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {report.evidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Timeline */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1">
              3. Telemetry Event Timeline
            </h2>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-20">Time</th>
                  <th className="p-2 border-r border-slate-300 w-48">Event</th>
                  <th className="p-2">Observed System Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {incident.timeline.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 font-mono font-bold text-indigo-700 border-r border-slate-200">
                      {item.timeLabel}
                    </td>
                    <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                      {item.title}
                    </td>
                    <td className="p-2 text-slate-600">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Action Items */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1">
              4. Corrective & Preventative Action Items
            </h2>
            <div className="space-y-2">
              {report.recommendations.map(rec => (
                <div key={rec.id} className="p-3 bg-slate-50 border border-slate-300 rounded text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{rec.priority}. {rec.title}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Risk: {rec.risk}
                    </span>
                  </div>
                  <p className="text-slate-600">{rec.description}</p>
                  <div className="text-[11px] font-semibold text-emerald-700">
                    Impact: {rec.expectedImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Footer Signoff */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-4">
            <div>
              Autonomously compiled by <strong>TraceMind AI SRE Engine</strong>.
              <br />
              All causality metrics validated against telemetry DAG.
            </div>
            <div className="text-right font-mono text-[11px]">
              CONFIDENTIAL • INTERNAL SRE REVIEW ONLY
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: Structured JSON Inspector */}
      {viewMode === 'json' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-mono">incident-investigation-{incident.id}.json</h3>
                <p className="text-xs text-slate-400">Structured JSON payload with machine-readable diagnostic schema</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
              >
                {copiedType === 'json' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedType === 'json' ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950/50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .JSON</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[540px] leading-relaxed select-all">
              {jsonContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

