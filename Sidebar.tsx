import React from 'react';
import {
  LayoutDashboard,
  Server,
  AlertOctagon,
  Sparkles,
  ScrollText,
  LineChart,
  GitBranch,
  Settings,
  Layers,
  FileText,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isIncidentActive: boolean;
  incidentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isIncidentActive,
  incidentCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Server, badge: '5 APIs' },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertOctagon,
      alertBadge: isIncidentActive ? `${incidentCount} Active` : undefined
    },
    {
      id: 'investigations',
      label: 'AI Investigations',
      icon: Sparkles,
      highlight: true,
      pulse: isIncidentActive
    },
    { id: 'logs', label: 'API Logs', icon: ScrollText },
    { id: 'metrics', label: 'Metrics', icon: LineChart },
    {
      id: 'deployments',
      label: 'Deployments',
      icon: GitBranch,
      badge: 'v2.4.1'
    },
    { id: 'report', label: 'Incident Report', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#070A12] border-r border-slate-800/80 flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Monitoring & AI Agent
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-cyan-950/90 to-indigo-950/70 border border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-950/30'
                        : 'bg-slate-800/80 text-white border border-slate-700/60 shadow'
                      : item.highlight
                      ? 'text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-200'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? item.highlight
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-700 text-white'
                          : 'bg-slate-900/80 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    )}

                    {item.alertBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-400">
                        {item.alertBadge}
                      </span>
                    )}

                    {item.badge && !item.alertBadge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* SRE Agent Engine Status Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800/70 px-3">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Agent Core</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Parallel analyzers streaming 1,284 RPS logs with Gemini 3.7 reasoning.
          </div>
        </div>
      </div>
    </aside>
  );
};
