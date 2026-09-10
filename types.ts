export type ServiceStatus = 'healthy' | 'degraded' | 'critical';

export interface Microservice {
  id: string;
  name: string;
  endpoint: string;
  status: ServiceStatus;
  healthScore: number;
  uptime: string;
  latencyMs: number;
  errorRate: number;
  requestVolume: number;
  lastDeployedVersion: string;
  dependencies: string[];
}

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'investigating' | 'diagnosed' | 'mitigated' | 'resolved';

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  timeLabel: string;
  title: string;
  description: string;
  type: 'normal' | 'warning' | 'error' | 'agent_action' | 'deployment';
}

export interface Incident {
  id: string;
  title: string;
  serviceId: string;
  serviceName: string;
  endpoint: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startTime: string;
  errorRate: number;
  latencySeconds: number;
  requestsCount: number;
  summary: string;
  impact: string;
  timeline: IncidentTimelineEvent[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  service: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  fingerprintCategory?: 'Database Timeout' | 'Authentication' | 'Rate Limit' | 'Unknown';
  stackTrace?: string;
  traceId: string;
  metadata?: Record<string, any>;
}

export interface MetricDataPoint {
  time: string;
  timestamp: number;
  errorRate: number;
  latencyMs: number;
  requestVolume: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  dbPoolUtilization: number;
  status2xx: number;
  status4xx: number;
  status5xx: number;
}

export interface DeploymentEvent {
  id: string;
  version: string;
  service: string;
  author: string;
  timestamp: string;
  timeAgo: string;
  commitHash: string;
  commitMessage: string;
  isCurrent: boolean;
  incidentCorrelation?: string;
  configChanges: {
    key: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface FingerprintCluster {
  category: 'Database Timeout' | 'Authentication' | 'Rate Limit' | 'Unknown';
  count: number;
  percentage: number;
  description: string;
  color: string;
  sampleMessage: string;
}

export interface EvidenceCorrelationNode {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  statBadge: string;
  type: 'deployment' | 'metric' | 'log' | 'impact';
  icon: string;
}

export interface RecommendedFixAction {
  id: string;
  priority: number;
  title: string;
  description: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedImpact: string;
  actionType: 'rollback' | 'config_change' | 'code_patch' | 'circuit_breaker';
  suggestedPatch?: {
    filename: string;
    language: string;
    codeBefore: string;
    codeAfter: string;
    explanation: string;
  };
}

export interface AgentInvestigationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  worker: 'Log Analyzer' | 'Metrics Analyzer' | 'Deployment Analyzer' | 'Correlation Engine' | 'Gemini Reasoner';
  durationMs?: number;
  findings?: string;
}

export interface AIInvestigationReport {
  incidentId: string;
  rootCause: string;
  confidence: number;
  confidenceTier: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'LOW CONFIDENCE';
  severity: IncidentSeverity;
  likelyTrigger: string;
  evidence: string[];
  whyExplanation: string[];
  evidenceChain: EvidenceCorrelationNode[];
  fingerprints: FingerprintCluster[];
  recommendations: RecommendedFixAction[];
  parallelFindings: {
    logAnalyzer: {
      recurringErrors: string[];
      topErrorRate: string;
      stackTraceSnippet: string;
    };
    metricsAnalyzer: {
      latencySpike: string;
      errorSpike: string;
      saturationPoint: string;
    };
    deploymentAnalyzer: {
      latestRelease: string;
      timeDelta: string;
      flaggedChanges: string[];
    };
  };
  generatedAt: string;
  investigationSteps: AgentInvestigationStep[];
}
