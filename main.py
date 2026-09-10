from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import os
from .models import (
    MicroserviceModel,
    IncidentModel,
    LogEntryModel,
    MetricDataPointModel,
    DeploymentEventModel,
    AIAnalysisRequest,
    FixRecommendationRequest,
    AIInvestigationReportModel
)
from .ai_agent import TraceMindAgent

app = FastAPI(
    title="TraceMind AI API",
    description="Autonomous AI Agent for API failure detection, root-cause analysis, and debugging recommendations.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = TraceMindAgent()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "product": "TraceMind AI", "version": "1.0.0"}

@app.get("/api/services")
def get_services():
    return {
        "services": [
            {
                "id": "payment-service",
                "name": "Payment API",
                "endpoint": "/api/payments",
                "status": "critical",
                "healthScore": 42,
                "uptime": "99.12%",
                "latencyMs": 2840,
                "errorRate": 18.7,
                "requestVolume": 12482,
                "lastDeployedVersion": "v2.4.1",
                "dependencies": ["Postgres-Cluster-Primary", "Redis-Session-Store", "Auth-Service"]
            },
            {
                "id": "order-service",
                "name": "Order API",
                "endpoint": "/api/orders",
                "status": "healthy",
                "healthScore": 98,
                "uptime": "99.98%",
                "latencyMs": 142,
                "errorRate": 0.12,
                "requestVolume": 28450,
                "lastDeployedVersion": "v2.3.8",
                "dependencies": ["Postgres-Replica", "Inventory-Service"]
            }
        ],
        "totalCount": 2,
        "criticalCount": 1
    }

@app.get("/api/incidents")
def get_incidents():
    return {
        "incidents": [
            {
                "id": "inc-9482",
                "title": "Payment API HTTP 500 Spike & Database Connection Starvation",
                "serviceId": "payment-service",
                "serviceName": "Payment API",
                "endpoint": "POST /api/payments",
                "severity": "CRITICAL",
                "status": "diagnosed",
                "startTime": "14:32:00 UTC",
                "errorRate": 18.7,
                "latencySeconds": 2.84,
                "requestsCount": 12482,
                "summary": "Severe degradation on POST /api/payments following deployment v2.4.1."
            }
        ]
    }

@app.post("/api/incidents/{incident_id}/investigate")
def investigate_incident(incident_id: str):
    report = agent.run_investigation(
        incident={"id": incident_id},
        logs=[],
        metrics=[],
        deployment={}
    )
    return {"success": True, "report": report}

@app.post("/api/ai/analyze")
def analyze_telemetry(req: AIAnalysisRequest):
    return agent.run_investigation(
        incident=req.incident or {},
        logs=req.logs or [],
        metrics=req.metrics or [],
        deployment=req.deployment or {}
    )

@app.post("/api/demo/trigger-incident")
def trigger_incident():
    return {"success": True, "message": "Incident triggered on payment-service."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
