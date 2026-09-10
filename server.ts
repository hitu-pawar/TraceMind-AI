import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_SERVICES,
  HEALTHY_SERVICES,
  INITIAL_INCIDENT,
  INITIAL_DEPLOYMENTS,
  INITIAL_LOGS,
  INITIAL_METRICS_SERIES,
  INITIAL_FINGERPRINTS,
  INITIAL_EVIDENCE_CHAIN,
  INITIAL_AI_REPORT,
  INITIAL_INVESTIGATION_STEPS
} from './src/data/mockData';
import {
  Microservice,
  Incident,
  LogEntry,
  MetricDataPoint,
  DeploymentEvent,
  AIInvestigationReport
} from './src/types';

dotenv.config();

const PORT = 3000;

// Mutable In-Memory State for the runtime session
let isIncidentActive = true;
let currentServices: Microservice[] = JSON.parse(JSON.stringify(INITIAL_SERVICES));
let currentIncidents: Incident[] = [JSON.parse(JSON.stringify(INITIAL_INCIDENT))];
let currentLogs: LogEntry[] = JSON.parse(JSON.stringify(INITIAL_LOGS));
let currentMetrics: MetricDataPoint[] = JSON.parse(JSON.stringify(INITIAL_METRICS_SERIES));
let currentDeployments: DeploymentEvent[] = JSON.parse(JSON.stringify(INITIAL_DEPLOYMENTS));
let currentAIReport: AIInvestigationReport = JSON.parse(JSON.stringify(INITIAL_AI_REPORT));

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

const FALLBACK_MODELS = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanJSONString(text: string): string {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean.trim();
}

async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  contents: string,
  systemInstruction?: string
): Promise<string | null> {
  for (const model of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
            ...(systemInstruction ? { systemInstruction } : {})
          }
        });
        if (response.text) {
          return cleanJSONString(response.text);
        }
      } catch (err: any) {
        const isDemandOrRateLimit =
          err?.status === 503 ||
          err?.status === 'UNAVAILABLE' ||
          err?.message?.includes('503') ||
          err?.message?.includes('high demand') ||
          err?.message?.includes('UNAVAILABLE') ||
          err?.status === 429 ||
          err?.message?.includes('429') ||
          err?.message?.includes('RESOURCE_EXHAUSTED');

        if (isDemandOrRateLimit && attempt < 2) {
          await delay(400 * attempt);
          continue;
        }
        // Try next fallback model in hierarchy
        break;
      }
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      systemOperational: !isIncidentActive,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/services
  app.get('/api/services', (req, res) => {
    res.json({
      services: currentServices,
      totalCount: currentServices.length,
      healthyCount: currentServices.filter(s => s.status === 'healthy').length,
      degradedCount: currentServices.filter(s => s.status === 'degraded').length,
      criticalCount: currentServices.filter(s => s.status === 'critical').length
    });
  });

  // GET /api/incidents
  app.get('/api/incidents', (req, res) => {
    res.json({
      incidents: currentIncidents,
      activeIncidentCount: currentIncidents.filter(i => i.status !== 'resolved').length
    });
  });

  // GET /api/logs
  app.get('/api/logs', (req, res) => {
    const { service, status, severity, category, search, limit = '100' } = req.query;

    let filtered = [...currentLogs];

    if (service && typeof service === 'string' && service !== 'all') {
      filtered = filtered.filter(l => l.service === service || l.service.includes(service));
    }
    if (status && typeof status === 'string' && status !== 'all') {
      const code = parseInt(status, 10);
      if (!isNaN(code)) {
        if (code === 500) filtered = filtered.filter(l => l.statusCode >= 500);
        else if (code === 400) filtered = filtered.filter(l => l.statusCode >= 400 && l.statusCode < 500);
        else if (code === 200) filtered = filtered.filter(l => l.statusCode >= 200 && l.statusCode < 300);
        else filtered = filtered.filter(l => l.statusCode === code);
      }
    }
    if (severity && typeof severity === 'string' && severity !== 'all') {
      filtered = filtered.filter(l => l.level === severity);
    }
    if (category && typeof category === 'string' && category !== 'all') {
      filtered = filtered.filter(l => l.fingerprintCategory === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        l =>
          l.message.toLowerCase().includes(q) ||
          l.endpoint.toLowerCase().includes(q) ||
          (l.stackTrace && l.stackTrace.toLowerCase().includes(q)) ||
          l.traceId.toLowerCase().includes(q)
      );
    }

    const limitNum = parseInt(limit as string, 10) || 100;
    res.json({
      logs: filtered.slice(0, limitNum),
      totalCount: filtered.length,
      fingerprints: INITIAL_FINGERPRINTS
    });
  });

  // GET /api/metrics
  app.get('/api/metrics', (req, res) => {
    res.json({
      series: currentMetrics,
      summary: {
        currentErrorRate: isIncidentActive ? 18.7 : 0.04,
        avgLatencyMs: isIncidentActive ? 2840 : 112,
        totalRequests: 12482,
        dbPoolSaturation: isIncidentActive ? 100 : 25,
        p95LatencyMs: isIncidentActive ? 3400 : 160,
        p99LatencyMs: isIncidentActive ? 4200 : 210
      }
    });
  });

  // GET /api/deployments
  app.get('/api/deployments', (req, res) => {
    res.json({
      deployments: currentDeployments,
      latest: currentDeployments[0]
    });
  });

  // POST /api/demo/trigger-incident
  app.post('/api/demo/trigger-incident', (req, res) => {
    isIncidentActive = true;
    currentServices = JSON.parse(JSON.stringify(INITIAL_SERVICES));
    currentIncidents = [JSON.parse(JSON.stringify(INITIAL_INCIDENT))];
    currentLogs = JSON.parse(JSON.stringify(INITIAL_LOGS));
    currentMetrics = JSON.parse(JSON.stringify(INITIAL_METRICS_SERIES));
    currentDeployments = JSON.parse(JSON.stringify(INITIAL_DEPLOYMENTS));
    currentAIReport = JSON.parse(JSON.stringify(INITIAL_AI_REPORT));

    res.json({
      success: true,
      message: 'Incident simulated successfully: POST /api/payments critical failure triggered.',
      incident: currentIncidents[0]
    });
  });

  // POST /api/demo/reset-incident
  app.post('/api/demo/reset-incident', (req, res) => {
    isIncidentActive = false;
    currentServices = JSON.parse(JSON.stringify(HEALTHY_SERVICES));
    currentIncidents = [];
    
    // Normal healthy metrics
    currentMetrics = [
      { time: '14:26', timestamp: 1, errorRate: 0.03, latencyMs: 98, requestVolume: 420, p95LatencyMs: 140, p99LatencyMs: 180, dbPoolUtilization: 22, status2xx: 419, status4xx: 1, status5xx: 0 },
      { time: '14:27', timestamp: 2, errorRate: 0.04, latencyMs: 102, requestVolume: 430, p95LatencyMs: 145, p99LatencyMs: 190, dbPoolUtilization: 24, status2xx: 428, status4xx: 2, status5xx: 0 },
      { time: '14:28', timestamp: 3, errorRate: 0.04, latencyMs: 105, requestVolume: 435, p95LatencyMs: 150, p99LatencyMs: 195, dbPoolUtilization: 25, status2xx: 433, status4xx: 2, status5xx: 0 },
      { time: '14:29', timestamp: 4, errorRate: 0.05, latencyMs: 108, requestVolume: 440, p95LatencyMs: 155, p99LatencyMs: 200, dbPoolUtilization: 26, status2xx: 438, status4xx: 2, status5xx: 0 },
      { time: '14:30', timestamp: 5, errorRate: 0.03, latencyMs: 102, requestVolume: 445, p95LatencyMs: 148, p99LatencyMs: 190, dbPoolUtilization: 24, status2xx: 443, status4xx: 2, status5xx: 0 },
      { time: '14:31', timestamp: 6, errorRate: 0.04, latencyMs: 106, requestVolume: 450, p95LatencyMs: 152, p99LatencyMs: 198, dbPoolUtilization: 25, status2xx: 448, status4xx: 2, status5xx: 0 },
      { time: '14:32', timestamp: 7, errorRate: 0.04, latencyMs: 104, requestVolume: 455, p95LatencyMs: 150, p99LatencyMs: 195, dbPoolUtilization: 24, status2xx: 453, status4xx: 2, status5xx: 0 },
      { time: '14:33', timestamp: 8, errorRate: 0.03, latencyMs: 101, requestVolume: 460, p95LatencyMs: 146, p99LatencyMs: 188, dbPoolUtilization: 23, status2xx: 458, status4xx: 2, status5xx: 0 },
      { time: '14:34', timestamp: 9, errorRate: 0.04, latencyMs: 103, requestVolume: 465, p95LatencyMs: 149, p99LatencyMs: 192, dbPoolUtilization: 24, status2xx: 463, status4xx: 2, status5xx: 0 }
    ];

    // Healthy logs sample
    currentLogs = [
      {
        id: 'log-h1',
        timestamp: new Date().toISOString(),
        timeFormatted: '14:34:40',
        service: 'payment-service',
        endpoint: 'POST /api/payments',
        statusCode: 200,
        latencyMs: 110,
        level: 'INFO',
        message: 'Payment processed successfully: tx_id=pay_998124 (amount=$49.00 USD)',
        traceId: 'tr-ok-901'
      },
      {
        id: 'log-h2',
        timestamp: new Date().toISOString(),
        timeFormatted: '14:34:42',
        service: 'order-service',
        endpoint: 'POST /api/orders',
        statusCode: 200,
        latencyMs: 125,
        level: 'INFO',
        message: 'Order created successfully: order_id=ord_110294',
        traceId: 'tr-ok-902'
      },
      {
        id: 'log-h3',
        timestamp: new Date().toISOString(),
        timeFormatted: '14:34:45',
        service: 'auth-service',
        endpoint: 'POST /api/auth/token',
        statusCode: 200,
        latencyMs: 65,
        level: 'INFO',
        message: 'JWT access token issued: user_id=usr_8819',
        traceId: 'tr-ok-903'
      }
    ];

    res.json({
      success: true,
      message: 'System reset to 100% operational baseline.',
      services: currentServices
    });
  });

  // POST /api/incidents/:id/investigate - Trigger AI Investigation Agent
  app.post('/api/incidents/:id/investigate', async (req, res) => {
    const incidentId = req.params.id;
    const ai = getGeminiClient();

    // Check if we can enrich using Gemini Reasoning Core
    if (ai) {
      try {
        const prompt = `You are TraceMind AI, an autonomous SRE/DevOps root-cause investigation agent.
Analyze the following incident telemetry:
Incident: ${JSON.stringify(currentIncidents[0] || INITIAL_INCIDENT)}
Recent Logs: ${JSON.stringify(currentLogs.slice(0, 10))}
Recent Deployment: ${JSON.stringify(currentDeployments[0])}
Metrics: Error Rate 18.7%, Latency 2.84s, DB Connection Pool Saturation 100%.

Return a structured JSON object with the following fields:
- root_cause: concise technical root cause title
- confidence: integer percentage (e.g. 93)
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
- likely_trigger: detailed trigger description
- evidence: list of 5 concrete evidence strings
- why_explanation: list of 5 why this diagnosis points
- recommendations: list of 4 prioritized actionable fix objects (priority, title, description, risk, expectedImpact)

Respond with valid JSON only.`;

        const jsonText = await generateGeminiContentWithFallback(ai, prompt);

        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.root_cause) {
            currentAIReport = {
              ...INITIAL_AI_REPORT,
              incidentId,
              rootCause: parsed.root_cause || INITIAL_AI_REPORT.rootCause,
              confidence: parsed.confidence || 93,
              likelyTrigger: parsed.likely_trigger || INITIAL_AI_REPORT.likelyTrigger,
              evidence: parsed.evidence || INITIAL_AI_REPORT.evidence,
              whyExplanation: parsed.why_explanation || INITIAL_AI_REPORT.whyExplanation,
              generatedAt: new Date().toISOString()
            };
          }
        }
      } catch (err) {
        // Fallback already pre-populated with verified domain report
      }
    }

    res.json({
      success: true,
      report: currentAIReport,
      steps: INITIAL_INVESTIGATION_STEPS
    });
  });

  // POST /api/ai/analyze - Direct AI Analysis endpoint
  app.post('/api/ai/analyze', async (req, res) => {
    const { incident, logs, metrics, deployment } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        root_cause: INITIAL_AI_REPORT.rootCause,
        confidence: 93,
        severity: 'CRITICAL',
        evidence: INITIAL_AI_REPORT.evidence,
        timeline: INITIAL_INCIDENT.timeline,
        recommendations: INITIAL_AI_REPORT.recommendations,
        explanation: INITIAL_AI_REPORT.whyExplanation.join('\n')
      });
    }

    try {
      const prompt = `Analyze this API incident as TraceMind AI:
Incident: ${JSON.stringify(incident || INITIAL_INCIDENT)}
Logs: ${JSON.stringify(logs || currentLogs.slice(0, 5))}
Metrics: ${JSON.stringify(metrics || currentMetrics.slice(-3))}
Deployment: ${JSON.stringify(deployment || currentDeployments[0])}

Return a valid JSON object with:
{
  "root_cause": string,
  "confidence": number,
  "severity": string,
  "evidence": string[],
  "timeline": object[],
  "recommendations": object[],
  "explanation": string
}`;

      const jsonText = await generateGeminiContentWithFallback(ai, prompt);
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        return res.json(parsed);
      }
    } catch (err: any) {
      // Fallback
    }

    res.json({
      root_cause: INITIAL_AI_REPORT.rootCause,
      confidence: 93,
      severity: 'CRITICAL',
      evidence: INITIAL_AI_REPORT.evidence,
      timeline: INITIAL_INCIDENT.timeline,
      recommendations: INITIAL_AI_REPORT.recommendations,
      explanation: INITIAL_AI_REPORT.whyExplanation.join('\n')
    });
  });

  // POST /api/ai/recommend-fix - Generate code fix patch
  app.post('/api/ai/recommend-fix', async (req, res) => {
    const { recommendationId, actionType, serviceName } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are TraceMind AI debugging engine.
Generate an executable code or configuration patch to fix:
Action Type: ${actionType || 'config_change'}
Service: ${serviceName || 'payment-service'}
Issue: Database connection pool exhaustion caused by synchronous query load.

Return JSON:
{
  "filename": string,
  "language": string,
  "codeBefore": string,
  "codeAfter": string,
  "explanation": string
}`;

        const jsonText = await generateGeminiContentWithFallback(ai, prompt);
        if (jsonText) {
          const patch = JSON.parse(jsonText);
          return res.json({ success: true, patch });
        }
      } catch (e) {
        // Fallback
      }
    }

    // Deterministic fallback patch
    const matchRec = INITIAL_AI_REPORT.recommendations.find(r => r.id === recommendationId) || INITIAL_AI_REPORT.recommendations[1];
    res.json({
      success: true,
      patch: matchRec.suggestedPatch
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TraceMind AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
