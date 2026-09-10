import React, { useState } from 'react';
import {
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Server,
  ShieldAlert,
  Flame,
  FileText,
  ScrollText,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Layers
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  isIncidentActive: boolean;
  onInvestigate: (incidentId?: string) => void;
  onNavigate: (tab: string) => void;
  onSimulateIncident: () => void;
  onResetIncident: () => void;
}

const HISTORICAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-9104',
    title: 'Auth Service Token Redis Eviction & Session Desync',
    serviceId: 'auth-service',
    serviceName: 'Auth Service',
    endpoint: 'POST /api/auth/token',
    severity: 'HIGH',
    status: 'resolved',
    startTime: 'Yesterday 18:20 UTC',
    errorRate: 4.8,
    latencySeconds: 0.74,
    requestsCount: 38400,
    summary: 'Redis cache memory threshold eviction caused cache misses on active JWT sessions, resulting in re-authentication retries and 4.8% error rate.',
    impact: 'Users on mobile web experienced intermittent login timeouts. ~410 authentication requests required retries.',
    timeline: [
      {
        id: 'tl-h1',
        timestamp: '18:15:00',
        timeLabel: '18:15',
        title: 'Redis Node Memory High',
        description: 'Memory utilization exceeded 85% threshold.',
        type: 'warning'
      },
      {
        id: 'tl-h2',
        timestamp: '18:20:00',
        timeLabel: '18:20',
        title: 'Session Desync Errors',
        description: 'Token validation began returning 401s on evicted keys.',
        type: 'error'
      },
      {
        id: 'tl-h3',
        timestamp: '18:32:00',
        timeLabel: '18:32',
        title: 'Auto-Scaling & Policy Adjusted',
        description: 'Memory ceiling increased to 16GB and maxmemory policy set to volatile-lru.',
        type: 'agent_action'
      }
    ]
  },
  {
    id: 'inc-8742',
    title: 'Inventory Sync Ingress Rate Limiter Over-Throttling',
    serviceId: 'inventory-service',
    serviceName: 'Inventory API',
    endpoint: 'GET /api/inventory/items',
    severity: 'MEDIUM',
    status: 'resolved',
    startTime: 'Aug 26 09:14 UTC',
    errorRate: 1.2,
    latencySeconds: 0.32,
    requestsCount: 22100,
    summary: 'Spike in bulk catalog synchronization queries tripped WAF rate-limiting rules incorrectly, dropping 1.2% of valid partner requests.',
    impact: 'Third-party merchants experienced 429 Too Many Requests responses during batch stock updates.',
    timeline: [
      {
        id: 'tl-h4',
        timestamp: '09:10:00',
        timeLabel: '09:10',
        title: 'Partner Stock Batch Triggered',
        description: 'Ingress traffic surged by +340% for inventory query route.',
        type: 'deployment'
      },
      {
        id: 'tl-h5',
        timestamp: '09:14:00',
        timeLabel: '09:14',
        title: 'Rate-Limit Bucket Exhausted',
        description: 'WAF returned HTTP 429 to 240 partner requests.',
        type: 'warning'
      },
      {
        id: 'tl-h6',
        timestamp: '09:25:00',
        timeLabel: '09:25',
        title: 'Dynamic Burst Window Applied',
        description: 'Rate limit ceiling scaled to 5,000 req/min for authenticated partners.',
        type: 'agent_action'
      }
    ]
  }
];

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  isIncidentActive,
  onInvestigate,
  onNavigate,
  onSimulateIncident,
  onResetIncident
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('all');

  // Combine live incidents + historical resolved logs
  const allIncidents = [
    ...incidents,
    ...HISTORICAL_INCIDENTS.filter(h => !incidents.some(i => i.id === h.id))
  ];

  const filteredIncidents = allIncidents.filter(inc => {
    // Status filter
    if (statusFilter === 'active' && inc.status === 'resolved') return false;
    if (statusFilter === 'resolved' && inc.status !== 'resolved') return false;

    // Severity filter
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.serviceName.toLowerCase().includes(q) ||
        inc.endpoint.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeIncidentsCount = allIncidents.filter(i => i.status !== 'resolved').length;
  const resolvedIncidentsCount = allIncidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Incident Management & Outage Tracker</span>
              {activeIncidentsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  {activeIncidentsCount} Active
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live API failure tracking, autonomous root cause diagnostics, and historical post-mortems
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isIncidentActive ? (
            <>
              <button
                onClick={() => onInvestigate(incidents[0]?.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>AI Root Cause Analysis</span>
              </button>
              <button
                onClick={onResetIncident}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                title="Mark all active incidents resolved"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resolve Outage</span>
              </button>
            </>
          ) : (
            <button
              onClick={onSimulateIncident}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all active:scale-95"
            >
              <Flame className="w-4 h-4" />
              <span>Simulate Outage</span>
            </button>
          )}
        </div>
      </div>

      {/* Vital Metric Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Outages</span>
            <Flame
              className={`w-4 h-4 ${
                activeIncidentsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'
              }`}
            />
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              activeIncidentsCount > 0 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {activeIncidentsCount}
          </div>
          <div className="text-[11px] text-slate-400">
            {activeIncidentsCount > 0 ? 'Requires immediate remediation' : 'All systems nominal'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Mean Time to Detect</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">1.2m</div>
          <div className="text-[11px] text-slate-400">Autonomous Anomaly Detection</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>AI Diagnostic SLA</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300 font-mono">3.4s</div>
          <div className="text-[11px] text-slate-400">Gemini 3.7 Causal Analysis</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {resolvedIncidentsCount}
          </div>
          <div className="text-[11px] text-slate-400">Post-mortems archived</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by incident title, service, endpoint, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({allIncidents.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'active'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeIncidentsCount})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved ({resolvedIncidentsCount})
            </button>
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical (P1)</option>
            <option value="HIGH">High (P2)</option>
            <option value="MEDIUM">Medium (P3)</option>
          </select>
        </div>
      </div>

      {/* Incidents List Cards */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Incidents Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No incidents match the active search filters or all production microservices are currently operating nominally within SLA.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSeverityFilter('all');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={onSimulateIncident}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Trigger Simulation Outage</span>
              </button>
            </div>
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const isActive = inc.status !== 'resolved';
            const isCritical = inc.severity === 'CRITICAL';

            return (
              <div
                key={inc.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-[#0B0F19] border-rose-600/50 shadow-xl shadow-rose-950/20 ring-1 ring-rose-500/20'
                    : 'bg-[#0B0F19]/90 border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Top Badge & Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Severity Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border flex items-center gap-1.5 ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border-rose-600/60'
                          : inc.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-600/60'
                          : 'bg-blue-950 text-blue-300 border-blue-600/60'
                      }`}
                    >
                      {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                      <span>{inc.severity} P1</span>
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isActive
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {inc.status}
                    </span>

                    <span className="text-xs font-mono text-slate-400">
                      ID: <span className="text-white font-bold">{inc.id}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{inc.startTime}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-slate-300">{inc.serviceName}</span>
                  </div>
                </div>

                {/* Incident Title & Affected Route */}
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{inc.title}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-cyan-300">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      <span>{inc.endpoint}</span>
                    </span>
                    <span className="text-slate-400">
                      Service: <strong className="text-slate-200">{inc.serviceName}</strong>
                    </span>
                  </div>
                </div>

                {/* Key Impact Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Peak Error Rate
                    </span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        inc.errorRate > 5 ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {inc.errorRate}% HTTP 500
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Average Latency
                    </span>
                    <span className="font-mono font-bold text-sm text-cyan-300">
                      {inc.latencySeconds}s
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Impacted Transactions
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-200">
                      ~{inc.requestsCount ? Math.round(inc.requestsCount * (inc.errorRate / 100)) : 2330}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      AI Diagnostic Status
                    </span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 text-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>93% High Confidence</span>
                    </span>
                  </div>
                </div>

                {/* Summary & Impact Text */}
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                    <strong className="text-slate-200">Summary: </strong>
                    {inc.summary}
                  </p>
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-200">
                    <strong className="text-rose-300">Customer Impact: </strong>
                    {inc.impact}
                  </div>
                </div>

                {/* Mini Telemetry Progression Timeline */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Incident Progression Timeline:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {inc.timeline.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-400">{event.timeLabel}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              event.type === 'deployment'
                                ? 'bg-purple-500/20 text-purple-300'
                                : event.type === 'error'
                                ? 'bg-rose-500/20 text-rose-300'
                                : event.type === 'agent_action'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {event.type}
                          </span>
                        </div>
                        <div className="font-bold text-slate-200 truncate">{event.title}</div>
                        <div className="text-slate-400 truncate">{event.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onNavigate('report')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Post-Mortem</span>
                    </button>
                    <button
                      onClick={() => onNavigate('logs')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
                    >
                      <ScrollText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspect Correlated Logs</span>
                    </button>
                    <button
                      onClick={() => onNavigate('architecture')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Architecture DAG</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onInvestigate(inc.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-950/50 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Run AI Investigation</span>
                    <ChevronRight className="w-4 h-4 text-cyan-300" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
