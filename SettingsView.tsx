import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Key,
  Bell,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react';

interface SettingsViewProps {
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [model, setModel] = useState('gemini-3.7-flash');
  const [samplingRate, setSamplingRate] = useState('100');
  const [autoRemediate, setAutoRemediate] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T000/B000/XXXX');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onShowToast('success', 'Settings Saved', 'Agent configuration updated successfully.');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>SRE Agent & AI Engine Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Gemini AI models, telemetry sampling thresholds, and alerting integrations
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* AI Engine Model Selection */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>AI Reasoning Core & Gemini Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: 'gemini-3.7-flash',
              name: 'Gemini 3.7 Flash',
              desc: 'High-speed reasoning core with deep root-cause causality and DAG evidence correlation.',
              recommended: true
            },
            {
              id: 'gemini-flash-latest',
              name: 'Gemini Flash Latest',
              desc: 'Ultra-low latency streaming model optimized for continuous telemetry pipelines.',
              recommended: false
            },
            {
              id: 'gemini-3.1-flash-lite',
              name: 'Gemini 3.1 Flash Lite',
              desc: 'High-throughput lightweight model with instant fail-fast response times.',
              recommended: false
            }
          ].map(m => (
            <div
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                model === m.id
                  ? 'bg-cyan-950/50 border-cyan-500 ring-2 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">{m.name}</span>
                {m.recommended && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Gemini API Key:</span>
            <span className="font-mono text-slate-400">GEMINI_API_KEY (Server-side Configured)</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Active
          </span>
        </div>
      </div>

      {/* Telemetry & Alerting Settings */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Alerting & Telemetry Sampling</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Slack / PagerDuty Webhook Integration
            </label>
            <input
              type="text"
              value={slackWebhook}
              onChange={e => setSlackWebhook(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">Autonomous Patch PR Creation</div>
              <div className="text-[11px] text-slate-400">
                Automatically create a GitHub Pull Request with the AI-synthesized fix when confidence exceeds 90%.
              </div>
            </div>
            <button
              onClick={() => setAutoRemediate(!autoRemediate)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                autoRemediate ? 'bg-cyan-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  autoRemediate ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
