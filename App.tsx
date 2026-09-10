import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { AiInvestigationView } from './components/AiInvestigationView';
import { LogExplorerView } from './components/LogExplorerView';
import { MetricsView } from './components/MetricsView';
import { DeploymentsView } from './components/DeploymentsView';
import { ServicesView } from './components/ServicesView';
import { IncidentReportView } from './components/IncidentReportView';
import { IncidentsView } from './components/IncidentsView';
import { ArchitectureView } from './components/ArchitectureView';
import { LandingView } from './components/LandingView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer, ToastMessage } from './components/Toast';

import {
  Microservice,
  Incident,
  LogEntry,
  MetricDataPoint,
  DeploymentEvent,
  AIInvestigationReport
} from './types';
import { apiClient } from './services/apiClient';
import {
  INITIAL_SERVICES,
  HEALTHY_SERVICES,
  INITIAL_INCIDENT,
  INITIAL_LOGS,
  INITIAL_METRICS_SERIES,
  INITIAL_DEPLOYMENTS,
  INITIAL_AI_REPORT,
  INITIAL_FINGERPRINTS
} from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isIncidentActive, setIsIncidentActive] = useState<boolean>(true);
  const [services, setServices] = useState<Microservice[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<Incident[]>([INITIAL_INCIDENT]);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [metrics, setMetrics] = useState<MetricDataPoint[]>(INITIAL_METRICS_SERIES);
  const [deployments, setDeployments] = useState<DeploymentEvent[]>(INITIAL_DEPLOYMENTS);
  const [aiReport, setAiReport] = useState<AIInvestigationReport>(INITIAL_AI_REPORT);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [logFilterCategory, setLogFilterCategory] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial load from backend
  useEffect(() => {
    async function loadData() {
      try {
        const svcData = await apiClient.getServices();
        if (svcData.services) setServices(svcData.services);

        const incData = await apiClient.getIncidents();
        if (incData.incidents) {
          setIncidents(incData.incidents);
          setIsIncidentActive(incData.incidents.some(i => i.status !== 'resolved'));
        }

        const logData = await apiClient.getLogs();
        if (logData.logs) setLogs(logData.logs);

        const metData = await apiClient.getMetrics();
        if (metData.series) setMetrics(metData.series);

        const depData = await apiClient.getDeployments();
        if (depData.deployments) setDeployments(depData.deployments);
      } catch (e) {
        console.warn('Using client-side state engine fallback:', e);
      }
    }
    loadData();
  }, []);

  const handleSimulateIncident = async () => {
    setIsIncidentActive(true);
    setServices(INITIAL_SERVICES);
    setIncidents([INITIAL_INCIDENT]);
    setMetrics(INITIAL_METRICS_SERIES);
    addToast('error', 'Critical Incident Detected', 'POST /api/payments error rate surged to 18.7%');
    try {
      await apiClient.triggerDemoIncident();
    } catch (e) {
      // client fallback ok
    }
  };

  const handleResetIncident = async () => {
    setIsIncidentActive(false);
    setServices(HEALTHY_SERVICES);
    setIncidents([]);
    // Normal healthy metrics
    setMetrics(prev =>
      prev.map(p => ({
        ...p,
        errorRate: 0.04,
        latencyMs: 112,
        p95LatencyMs: 160,
        p99LatencyMs: 220,
        dbPoolUtilization: 25,
        status5xx: 0
      }))
    );
    addToast('success', 'System Operational', 'All microservices recovered to nominal status.');
    try {
      await apiClient.resetDemoIncident();
    } catch (e) {
      // client fallback ok
    }
  };

  const handleInvestigate = async (incidentId?: string) => {
    setActiveTab('investigations');
    setIsInvestigating(true);
    addToast('info', 'AI Agent Activated', 'Dispatching parallel log, metric & deployment analyzers...');

    try {
      const res = await apiClient.runInvestigation(incidentId || INITIAL_INCIDENT.id);
      if (res.report) {
        setAiReport(res.report);
      }
      setTimeout(() => {
        setIsInvestigating(false);
        addToast('success', 'Investigation Complete', 'Root cause identified: HikariCP pool exhaustion (93% confidence)');
      }, 1200);
    } catch (e) {
      setIsInvestigating(false);
    }
  };

  const handleNavigateToLogs = (category?: string) => {
    setLogFilterCategory(category || null);
    setActiveTab('logs');
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Global Top Navigation Bar */}
      <Header
        isIncidentActive={isIncidentActive}
        onSimulateIncident={handleSimulateIncident}
        onResetIncident={handleResetIncident}
        onNavigate={setActiveTab}
        activeTab={activeTab}
        isInvestigating={isInvestigating}
        onStartInvestigation={() => handleInvestigate(INITIAL_INCIDENT.id)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          isIncidentActive={isIncidentActive}
          incidentCount={isIncidentActive ? 1 : 0}
        />

        {/* Scrollable Workspace Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && (
            <DashboardOverview
              services={services}
              incidents={incidents}
              metrics={metrics}
              isIncidentActive={isIncidentActive}
              onInvestigate={handleInvestigate}
              onNavigate={setActiveTab}
              onSimulateIncident={handleSimulateIncident}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              isIncidentActive={isIncidentActive}
              onInvestigate={handleInvestigate}
              onNavigate={setActiveTab}
              onSimulateIncident={handleSimulateIncident}
              onResetIncident={handleResetIncident}
            />
          )}

          {activeTab === 'investigations' && (
            <AiInvestigationView
              report={aiReport}
              isInvestigating={isInvestigating}
              onRerunInvestigation={() => handleInvestigate(INITIAL_INCIDENT.id)}
              onNavigateToLogs={handleNavigateToLogs}
              onNavigateToReport={() => setActiveTab('report')}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'logs' && (
            <LogExplorerView
              logs={logs}
              fingerprints={INITIAL_FINGERPRINTS}
              initialCategory={logFilterCategory}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'metrics' && (
            <MetricsView metrics={metrics} isIncidentActive={isIncidentActive} />
          )}

          {activeTab === 'deployments' && (
            <DeploymentsView
              deployments={deployments}
              onInvestigateIncident={() => handleInvestigate(INITIAL_INCIDENT.id)}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              services={services}
              onInvestigate={() => handleInvestigate(INITIAL_INCIDENT.id)}
            />
          )}

          {activeTab === 'report' && (
            <IncidentReportView
              incident={incidents[0] || INITIAL_INCIDENT}
              report={aiReport}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'architecture' && <ArchitectureView />}

          {activeTab === 'landing' && (
            <LandingView
              onLaunchDemo={() => setActiveTab('overview')}
              onSimulateIncident={() => {
                handleSimulateIncident();
                setActiveTab('overview');
              }}
            />
          )}

          {activeTab === 'settings' && <SettingsView onShowToast={addToast} />}
        </main>
      </div>
    </div>
  );
}

export default App;
