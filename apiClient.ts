import {
  Microservice,
  Incident,
  LogEntry,
  MetricDataPoint,
  DeploymentEvent,
  AIInvestigationReport,
  RecommendedFixAction
} from '../types';
import {
  INITIAL_SERVICES,
  HEALTHY_SERVICES,
  INITIAL_INCIDENT,
  INITIAL_LOGS,
  INITIAL_METRICS_SERIES,
  INITIAL_DEPLOYMENTS,
  INITIAL_AI_REPORT,
  INITIAL_INVESTIGATION_STEPS
} from '../data/mockData';

export const apiClient = {
  async getServices(): Promise<{ services: Microservice[]; totalCount: number; healthyCount: number; criticalCount: number }> {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return await res.json();
    } catch (e) {
      return {
        services: INITIAL_SERVICES,
        totalCount: INITIAL_SERVICES.length,
        healthyCount: INITIAL_SERVICES.filter(s => s.status === 'healthy').length,
        criticalCount: INITIAL_SERVICES.filter(s => s.status === 'critical').length
      };
    }
  },

  async getIncidents(): Promise<{ incidents: Incident[]; activeIncidentCount: number }> {
    try {
      const res = await fetch('/api/incidents');
      if (!res.ok) throw new Error('Failed to fetch incidents');
      return await res.json();
    } catch (e) {
      return {
        incidents: [INITIAL_INCIDENT],
        activeIncidentCount: 1
      };
    }
  },

  async getLogs(params?: { service?: string; status?: string; severity?: string; category?: string; search?: string }): Promise<{ logs: LogEntry[]; totalCount: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.service) query.set('service', params.service);
      if (params?.status) query.set('status', params.status);
      if (params?.severity) query.set('severity', params.severity);
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`/api/logs?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      return await res.json();
    } catch (e) {
      return {
        logs: INITIAL_LOGS,
        totalCount: INITIAL_LOGS.length
      };
    }
  },

  async getMetrics(): Promise<{ series: MetricDataPoint[]; summary: any }> {
    try {
      const res = await fetch('/api/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    } catch (e) {
      return {
        series: INITIAL_METRICS_SERIES,
        summary: {
          currentErrorRate: 18.7,
          avgLatencyMs: 2840,
          totalRequests: 12482,
          dbPoolSaturation: 100
        }
      };
    }
  },

  async getDeployments(): Promise<{ deployments: DeploymentEvent[]; latest: DeploymentEvent }> {
    try {
      const res = await fetch('/api/deployments');
      if (!res.ok) throw new Error('Failed to fetch deployments');
      return await res.json();
    } catch (e) {
      return {
        deployments: INITIAL_DEPLOYMENTS,
        latest: INITIAL_DEPLOYMENTS[0]
      };
    }
  },

  async runInvestigation(incidentId: string): Promise<{ success: boolean; report: AIInvestigationReport; steps: any[] }> {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/investigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Investigation request failed');
      return await res.json();
    } catch (e) {
      return {
        success: true,
        report: INITIAL_AI_REPORT,
        steps: INITIAL_INVESTIGATION_STEPS
      };
    }
  },

  async generateCodeFix(recommendationId: string, actionType: string, serviceName: string): Promise<{ success: boolean; patch: any }> {
    try {
      const res = await fetch('/api/ai/recommend-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, actionType, serviceName })
      });
      if (!res.ok) throw new Error('Fix generation failed');
      return await res.json();
    } catch (e) {
      const rec = INITIAL_AI_REPORT.recommendations.find(r => r.id === recommendationId) || INITIAL_AI_REPORT.recommendations[1];
      return {
        success: true,
        patch: rec.suggestedPatch
      };
    }
  },

  async triggerDemoIncident(): Promise<{ success: boolean; message: string; incident: Incident }> {
    try {
      const res = await fetch('/api/demo/trigger-incident', { method: 'POST' });
      if (!res.ok) throw new Error('Trigger failed');
      return await res.json();
    } catch (e) {
      return {
        success: true,
        message: 'Incident simulated (Fallback mode)',
        incident: INITIAL_INCIDENT
      };
    }
  },

  async resetDemoIncident(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/demo/reset-incident', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      return await res.json();
    } catch (e) {
      return {
        success: true,
        message: 'System reset to operational (Fallback mode)'
      };
    }
  }
};
