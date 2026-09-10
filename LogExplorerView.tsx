import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Terminal,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { LogEntry, FingerprintCluster } from '../types';

interface LogExplorerViewProps {
  logs: LogEntry[];
  fingerprints: FingerprintCluster[];
  initialCategory?: string | null;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, msg: string) => void;
}

export const LogExplorerView: React.FC<LogExplorerViewProps> = ({
  logs,
  fingerprints,
  initialCategory,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>('log-101');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    if (selectedService !== 'all' && log.service !== selectedService) return false;
    if (selectedSeverity !== 'all' && log.level !== selectedSeverity) return false;
    if (selectedStatus !== 'all') {
      const code = parseInt(selectedStatus, 10);
      if (code === 500 && log.statusCode < 500) return false;
      if (code === 400 && (log.statusCode < 400 || log.statusCode >= 500)) return false;
      if (code === 200 && (log.statusCode < 200 || log.statusCode >= 300)) return false;
    }
    if (selectedCategory !== 'all' && log.fingerprintCategory !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        log.message.toLowerCase().includes(q) ||
        log.endpoint.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q) ||
        (log.stackTrace && log.stackTrace.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleCopyLog = (log: LogEntry) => {
    const text = `[${log.timeFormatted}] ${log.level} ${log.service} (${log.statusCode}) - ${log.message}\nTraceId: ${log.traceId}\n${log.stackTrace || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast('success', 'Log Copied', `Copied log ${log.traceId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            <span>API Log Explorer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming real-time structured logs with latency percentiles & stack trace inspector
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="font-bold text-cyan-400">{filteredLogs.length}</span> of {logs.length} events
        </div>
      </div>

      {/* Fingerprint Quick Cluster Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter by Pattern:
        </span>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-700 text-white shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Errors
        </button>
        {fingerprints.map(fp => (
          <button
            key={fp.category}
            onClick={() => setSelectedCategory(fp.category)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === fp.category
                ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fp.color }} />
            <span>{fp.category}</span>
            <span className="font-mono text-[10px] text-slate-400">({fp.count})</span>
          </button>
        ))}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search message, trace ID, stack trace..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Service filter */}
        <select
          value={selectedService}
          onChange={e => setSelectedService(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Services</option>
          <option value="payment-service">payment-service</option>
          <option value="order-service">order-service</option>
          <option value="auth-service">auth-service</option>
          <option value="user-service">user-service</option>
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Status Codes</option>
          <option value="500">5xx Server Error</option>
          <option value="400">4xx Client Error</option>
          <option value="200">2xx Success</option>
        </select>

        {/* Severity filter */}
        <select
          value={selectedSeverity}
          onChange={e => setSelectedSeverity(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Severities</option>
          <option value="ERROR">ERROR only</option>
          <option value="WARN">WARN only</option>
          <option value="INFO">INFO only</option>
        </select>
      </div>

      {/* Log Feed Table */}
      <div className="rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No matching log records found for the active filter query.
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} className="transition-colors hover:bg-slate-900/50">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <div className="text-slate-500 mt-0.5 md:mt-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>

                      <span className="font-mono text-xs text-slate-400 shrink-0">
                        {log.timeFormatted}
                      </span>

                      {/* Level Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          log.level === 'ERROR'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : log.level === 'WARN'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {log.level}
                      </span>

                      {/* Service & Endpoint */}
                      <span className="text-xs font-mono font-semibold text-slate-300 shrink-0">
                        {log.service}
                      </span>

                      {/* Message Preview */}
                      <p className="text-xs text-slate-200 truncate">{log.message}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-7 md:ml-0">
                      {/* Latency badge */}
                      <span className="text-[11px] font-mono text-slate-400">
                        {log.latencyMs >= 1000 ? `${(log.latencyMs / 1000).toFixed(1)}s` : `${log.latencyMs}ms`}
                      </span>

                      {/* Status code badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          log.statusCode >= 500
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : log.statusCode >= 400
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {log.statusCode}
                      </span>

                      {/* Copy Action */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCopyLog(log);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy log entry"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail View / Stack Trace */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 bg-slate-950/80 border-t border-slate-800/60 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2">
                        <div>
                          <span className="text-slate-500">Trace ID: </span>
                          <span className="text-cyan-300">{log.traceId}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Endpoint: </span>
                          <span className="text-slate-200">{log.endpoint}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Timestamp: </span>
                          <span className="text-slate-200">{log.timestamp}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Category: </span>
                          <span className="text-amber-300">{log.fingerprintCategory || 'General'}</span>
                        </div>
                      </div>

                      {log.stackTrace && (
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                            Stack Trace:
                          </div>
                          <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto whitespace-pre leading-relaxed">
                            {log.stackTrace}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
