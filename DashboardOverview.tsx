import React, { useMemo } from 'react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Zap,
  ChevronRight,
  ShieldAlert,
  GitCommit,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Microservice, Incident, MetricDataPoint } from '../types';

interface DashboardOverviewProps {
  services: Microservice[];
  incidents: Incident[];
  metrics: MetricDataPoint[];
  isIncidentActive: boolean;
  onInvestigate: (incidentId: string) => void;
  onNavigate: (tab: string) => void;
  onSimulateIncident: () => void;
}

interface SparklinePoint {
  time: string;
  value: number;
}

interface MetricSparklineProps {
  data: SparklinePoint[];
  color: string;
  gradientId: string;
  unit?: string;
}

const CustomSparklineTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="px-2 py-1 bg-slate-950/95 border border-slate-700/80 rounded shadow-lg text-[10px] font-mono text-slate-200 pointer-events-none z-50">
        <span className="text-slate-400">{point.time}: </span>
        <span className="font-bold text-white">
          {point.value}
          {unit || ''}
        </span>
      </div>
    );
  }
  return null;
};

const MetricSparkline: React.FC<MetricSparklineProps> = ({
  data,
  color,
  gradientId,
  unit
}) => {
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 1, left: 1, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={<CustomSparklineTooltip unit={unit} />}
            isAnimationActive={false}
            cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '2 2' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.75}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  services,
  incidents,
  metrics,
  isIncidentActive,
  onInvestigate,
  onNavigate,
  onSimulateIncident
}) => {
  const activeIncident = incidents.find(i => i.status !== 'resolved');
  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const criticalCount = services.filter(s => s.status === 'critical').length;

  const currentErrorRate = isIncidentActive ? 18.7 : 0.04;
  const currentLatency = isIncidentActive ? '2.84s' : '112ms';

  // Generate 24-hour sparkline trends for key metric cards
  const hoursLabels = useMemo(
    () => [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
      '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ],
    []
  );

  const totalApisTrend: SparklinePoint[] = useMemo(() => {
    return hoursLabels.map((time, idx) => ({
      time,
      value: idx < 6 ? 4 : 5
    }));
  }, [hoursLabels]);

  const healthyServicesTrend: SparklinePoint[] = useMemo(() => {
    return hoursLabels.map((time, idx) => {
      if (isIncidentActive) {
        if (idx === 21) return { time, value: 4 };
        if (idx >= 22) return { time, value: 3 };
      }
      return { time, value: 5 };
    });
  }, [hoursLabels, isIncidentActive]);

  const activeIncidentsTrend: SparklinePoint[] = useMemo(() => {
    return hoursLabels.map((time, idx) => {
      if (isIncidentActive && idx >= 21) {
        return { time, value: 1 };
      }
      return { time, value: 0 };
    });
  }, [hoursLabels, isIncidentActive]);

  const errorRateTrend: SparklinePoint[] = useMemo(() => {
    const baselines = [
      0.04, 0.05, 0.04, 0.03, 0.04, 0.05, 0.06, 0.04,
      0.05, 0.04, 0.06, 0.05, 0.04, 0.05, 0.06, 0.04,
      0.05, 0.04, 0.05, 0.04, 0.05, 1.8, 6.4, 18.7
    ];
    return hoursLabels.map((time, idx) => ({
      time,
      value: isIncidentActive ? baselines[idx] : idx >= 21 ? 0.04 : baselines[idx]
    }));
  }, [hoursLabels, isIncidentActive]);

  const latencyTrend: SparklinePoint[] = useMemo(() => {
    const latencies = [
      112, 115, 110, 114, 112, 118, 115, 112,
      116, 114, 113, 118, 115, 112, 116, 114,
      112, 115, 113, 116, 120, 890, 1750, 2840
    ];
    return hoursLabels.map((time, idx) => ({
      time,
      value: isIncidentActive ? latencies[idx] : idx >= 21 ? 112 : latencies[idx]
    }));
  }, [hoursLabels, isIncidentActive]);

  return (
    <div className="space-y-6">
      {/* Active Incident Alert Banner (if incident active) */}
      {isIncidentActive && activeIncident && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#160d1b] to-[#0d121f] border border-rose-600/40 p-5 shadow-2xl shadow-rose-950/30">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Critical Incident Detected
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {activeIncident.startTime}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {activeIncident.title}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {activeIncident.summary}
              </p>

              {/* Anomaly Metrics Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400">Endpoint: </span>
                  <span className="font-mono font-semibold text-rose-300">
                    {activeIncident.endpoint}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400">Error Rate: </span>
                  <span className="font-bold text-rose-400 font-mono">
                    {activeIncident.errorRate}%
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400">Avg Latency: </span>
                  <span className="font-bold text-amber-400 font-mono">
                    {activeIncident.latencySeconds}s
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400">Requests: </span>
                  <span className="font-bold text-slate-200 font-mono">
                    {activeIncident.requestsCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Investigation Trigger Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onInvestigate(activeIncident.id)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-cyan-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-cyan-200 fill-cyan-200" />
                <span>Investigate with AI</span>
              </button>
            </div>
          </div>

          {/* Anomaly Timeline Strip */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Anomaly Timeline
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {activeIncident.timeline.map((event, idx) => (
                <div
                  key={event.id}
                  className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    event.type === 'deployment'
                      ? 'bg-indigo-950/40 border-indigo-700/40 text-indigo-200'
                      : event.type === 'warning'
                      ? 'bg-amber-950/40 border-amber-700/40 text-amber-200'
                      : event.type === 'error'
                      ? 'bg-rose-950/50 border-rose-700/50 text-rose-200'
                      : event.type === 'agent_action'
                      ? 'bg-cyan-950/50 border-cyan-600/50 text-cyan-200 ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] opacity-80 mb-1">
                    <span>{event.timeLabel}</span>
                    <span className="uppercase font-bold tracking-tight text-[9px]">
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-semibold leading-snug line-clamp-1">{event.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Overview 5 Metric Cards with 24-Hour Trend Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total APIs */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total APIs</span>
              <Server className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">
              {services.length}
            </div>
          </div>
          <MetricSparkline
            data={totalApisTrend}
            color="#38bdf8"
            gradientId="sparklineTotalApis"
            unit=" APIs"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/70">
            <span>Microservice mesh</span>
            <span className="font-mono text-sky-400 text-[10px]">24h: steady</span>
          </div>
        </div>

        {/* Healthy Services */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Healthy Services</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {healthyCount}/{services.length}
            </div>
          </div>
          <MetricSparkline
            data={healthyServicesTrend}
            color={isIncidentActive ? '#f59e0b' : '#10b981'}
            gradientId="sparklineHealthyServices"
            unit=" healthy"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/70">
            <span className="truncate mr-1">
              {criticalCount > 0 ? `${criticalCount} critical` : 'All nominal'}
            </span>
            <span className="font-mono text-emerald-400 text-[10px] shrink-0">
              {isIncidentActive ? '99.12% SLA' : '99.98% SLA'}
            </span>
          </div>
        </div>

        {/* Active Incidents */}
        <div
          onClick={() => onNavigate('incidents')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-xl border backdrop-blur-sm flex flex-col justify-between space-y-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.99] ${
            isIncidentActive
              ? 'bg-rose-950/30 border-rose-600/40 text-rose-100 hover:border-rose-500'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className={isIncidentActive ? 'text-rose-300 font-semibold' : 'text-slate-400'}>
                Active Incidents
              </span>
              <Flame
                className={`w-4 h-4 ${isIncidentActive ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}
              />
            </div>
            <div
              className={`text-2xl font-extrabold font-mono mt-1 ${
                isIncidentActive ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {isIncidentActive ? '1 CRITICAL' : '0'}
            </div>
          </div>
          <MetricSparkline
            data={activeIncidentsTrend}
            color={isIncidentActive ? '#f43f5e' : '#10b981'}
            gradientId="sparklineActiveIncidents"
            unit=" active"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/70">
            <span className="truncate mr-1">
              {isIncidentActive ? 'Diagnosed' : 'Zero outages'}
            </span>
            <span
              className={`font-mono text-[10px] shrink-0 ${
                isIncidentActive ? 'text-rose-400 font-bold' : 'text-slate-400'
              }`}
            >
              {isIncidentActive ? '+1 (4m ago)' : '24h clear'}
            </span>
          </div>
        </div>

        {/* Error Rate */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Error Rate</span>
              <TrendingUp
                className={`w-4 h-4 ${currentErrorRate > 1 ? 'text-rose-400' : 'text-emerald-400'}`}
              />
            </div>
            <div
              className={`text-2xl font-extrabold font-mono mt-1 ${
                currentErrorRate > 1 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {currentErrorRate}%
            </div>
          </div>
          <MetricSparkline
            data={errorRateTrend}
            color={currentErrorRate > 1 ? '#f43f5e' : '#10b981'}
            gradientId="sparklineErrorRate"
            unit="%"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/70">
            <span className="truncate mr-1">
              {isIncidentActive ? '+18.6% surge' : 'Within 99.95% SLO'}
            </span>
            <span
              className={`font-mono text-[10px] shrink-0 ${
                isIncidentActive ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}
            >
              {isIncidentActive ? '18.7% peak' : '0.04% avg'}
            </span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Average Latency</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div
              className={`text-2xl font-extrabold font-mono mt-1 ${
                isIncidentActive ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {currentLatency}
            </div>
          </div>
          <MetricSparkline
            data={latencyTrend}
            color={isIncidentActive ? '#f59e0b' : '#38bdf8'}
            gradientId="sparklineLatency"
            unit="ms"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/70">
            <span className="truncate mr-1">
              {isIncidentActive ? 'P95: 3.4s' : 'P95: 160ms'}
            </span>
            <span className="font-mono text-cyan-400 text-[10px] shrink-0">
              {isIncidentActive ? 'Bottleneck' : '112ms avg'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Rate Trend Chart */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                API Error Rate (%) — Anomaly Spike
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Surge detected immediately post-release v2.4.1 (14:28 UTC)
              </p>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                isIncidentActive
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {currentErrorRate}% Current
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="errorRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#errorRateGrad)"
                  name="Error Rate (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency & DB Saturation Chart */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Latency (P95 vs Average) & Connection Pool
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                HikariCP active connections vs response latency (ms)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              P95: {isIncidentActive ? '3,400ms' : '160ms'}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="latencyMs"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  name="Avg Latency (ms)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="p95LatencyMs"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name="P95 Latency (ms)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Service Health List & HTTP Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Health List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Service Mesh Health</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time status across payment, order, auth, user & notification APIs
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {services.map(svc => (
              <div
                key={svc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      svc.status === 'critical'
                        ? 'bg-rose-500 animate-pulse'
                        : svc.status === 'degraded'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{svc.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {svc.endpoint}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Release {svc.lastDeployedVersion} • {svc.dependencies.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono font-bold text-slate-200">
                      {svc.latencyMs}ms
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {svc.errorRate}% err
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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
              </div>
            ))}
          </div>
        </div>

        {/* HTTP Status Code Distribution */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">HTTP Status Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Traffic response breakdown (2xx, 4xx, 5xx)
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.slice(-6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="status2xx" stackId="a" fill="#10b981" name="2xx Success" />
                <Bar dataKey="status4xx" stackId="a" fill="#f59e0b" name="4xx Client" />
                <Bar dataKey="status5xx" stackId="a" fill="#f43f5e" name="5xx Server" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>500 Errors in Last 5m:</span>
            <span className="font-mono font-bold text-rose-400">
              {isIncidentActive ? '743 failures' : '0 failures'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
