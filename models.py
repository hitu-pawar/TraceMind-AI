from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MicroserviceModel(BaseModel):
    id: str
    name: str
    endpoint: str
    status: str
    healthScore: int
    uptime: str
    latencyMs: int
    errorRate: float
    requestVolume: int
    lastDeployedVersion: str
    dependencies: List[str] = []

class IncidentTimelineEvent(BaseModel):
    id: str
    timestamp: str
    timeLabel: str
    title: str
    description: str
    type: str

class IncidentModel(BaseModel):
    id: str
    title: str
    serviceId: str
    serviceName: str
    endpoint: str
    severity: str
    status: str
    startTime: str
    errorRate: float
    latencySeconds: float
    requestsCount: int
    summary: str
    impact: str
    timeline: List[IncidentTimelineEvent] = []

class LogEntryModel(BaseModel):
    id: str
    timestamp: str
    timeFormatted: str
    service: str
    endpoint: str
    statusCode: int
    latencyMs: int
    level: str
    message: str
    fingerprintCategory: Optional[str] = None
    stackTrace: Optional[str] = None
    traceId: str

class MetricDataPointModel(BaseModel):
    time: str
    timestamp: int
    errorRate: float
    latencyMs: int
    requestVolume: int
    p95LatencyMs: int
    p99LatencyMs: int
    dbPoolUtilization: int
    status2xx: int
    status4xx: int
    status5xx: int

class DeploymentEventModel(BaseModel):
    id: str
    version: str
    service: str
    author: str
    timestamp: str
    timeAgo: str
    commitHash: str
    commitMessage: str
    isCurrent: bool
    incidentCorrelation: Optional[str] = None
    configChanges: List[Dict[str, str]] = []

class RecommendedFixActionModel(BaseModel):
    id: str
    priority: int
    title: str
    description: str
    risk: str
    expectedImpact: str
    actionType: str
    suggestedPatch: Optional[Dict[str, Any]] = None

class AIInvestigationReportModel(BaseModel):
    incidentId: str
    rootCause: str
    confidence: int
    confidenceTier: str
    severity: str
    likelyTrigger: str
    evidence: List[str]
    whyExplanation: List[str]
    evidenceChain: List[Dict[str, Any]]
    fingerprints: List[Dict[str, Any]]
    recommendations: List[RecommendedFixActionModel]
    generatedAt: str

class AIAnalysisRequest(BaseModel):
    incident: Optional[Dict[str, Any]] = None
    logs: Optional[List[Dict[str, Any]]] = None
    metrics: Optional[List[Dict[str, Any]]] = None
    deployment: Optional[Dict[str, Any]]] = None

class FixRecommendationRequest(BaseModel):
    recommendationId: str
    actionType: Optional[str] = "config_change"
    serviceName: Optional[str] = "payment-service"
