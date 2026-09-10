import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  LineChart as ChartIcon,
  Activity,
  Cpu,
  Clock,
  TrendingUp,
  AlertTriangle,
  Database
} from 'lucide-react';
import { MetricDataPoint } from '../types';

interface MetricsViewProps {
  metrics: MetricDataPoint[];
  isIncidentActive: boolean;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ metrics, isIncidentActive }) => {
  const [timeRange, setTimeRange] = useState('15m');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            <span>Infrastructure & API Metrics Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            High-resolution 1-second telemetry for payment, order, auth, and database pool saturation
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold text-slate-300">
          {['5m', '15m', '1h', '6h', '24h'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeRange === range
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold shadow'
                  : 'hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>P95 Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {isIncidentActive ? '3,400ms' : '160ms'}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold">
            {isIncidentActive ? '+2,025% degradation' : 'Nominal'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>DB Pool Saturation</span>
            <Database className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-400">
            {isIncidentActive ? '100% (20/20)' : '25% (5/20)'}
          </div>
          <div className="text-[11px] text-rose-300 font-semibold">
            {isIncidentActive ? '129 threads starved' : '15 idle connections'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Throughput (RPS)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            495 RPS
          </div>
          <div className="text-[11px] text-slate-400">
            12,482 total transactions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Error Budget Burn</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">
            {isIncidentActive ? '18.7x' : '0.0x'}
          </div>
          <div className="text-[11px] text-rose-400 font-semibold">
            {isIncidentActive ? 'SLO Breached' : '99.99% Availability'}
          </div>
        </div>
      </div>

      {/* Latency Percentiles & DB Pool Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Percentiles Chart */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Latency Distribution (Average vs P95 vs P99)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exponential tail latency surge starting at 14:30 UTC
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
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
                <Line type="monotone" dataKey="latencyMs" stroke="#38bdf8" strokeWidth={2} name="Avg (ms)" />
                <Line type="monotone" dataKey="p95LatencyMs" stroke="#f59e0b" strokeWidth={2} name="P95 (ms)" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="p99LatencyMs" stroke="#f43f5e" strokeWidth={2} name="P99 (ms)" strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Database Connection Pool Saturation Chart */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                HikariCP Connection Pool Utilization (%)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pool pinned at 100% capacity (20/20 active connections)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
              Limit: 20 conns
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="poolGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 100]} />
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
                  dataKey="dbPoolUtilization"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#poolGrad)"
                  name="DB Pool Utilization (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
