# TraceMind AI - Autonomous API Failure Detection & Root Cause Analysis

<div align="center">
  <h3>Detect. Diagnose. Fix API Failures.</h3>
  <p>An autonomous AI agent for API failure detection, parallel evidence investigation, root-cause analysis, and debugging recommendations.</p>
</div>

## Features

- **Real-time Incident Detection**: Automatically detects API failures and service degradation
- **AI-Powered Root Cause Analysis**: Uses Gemini AI to analyze logs, metrics, and deployment data
- **Parallel Evidence Investigation**: Investigates multiple data sources simultaneously
- **Interactive Dashboard**: Modern, dark-themed UI with real-time metrics and visualizations
- **Log Explorer**: Advanced filtering and search capabilities for log analysis
- **Service Health Monitoring**: Track microservice health status across your infrastructure
- **Deployment Tracking**: Monitor deployment events and correlate with incidents
- **Code Fix Recommendations**: AI-generated patches to resolve identified issues

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Express.js, Node.js
- **Build Tool**: Vite 6
- **AI Integration**: Google Gemini AI (@google/genai)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Motion

## Prerequisites

- Node.js 18+ 
- npm or bun
- Gemini API Key (optional - falls back to mock data)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Tanya-garg10/TraceMind-AI-Autonomous-API-Failure-Detection-Root-Cause-Analysis.git
cd TraceMind-AI-Autonomous-API-Failure-Detection-Root-Cause-Analysis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API Key (optional):
```
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Usage

1. **Dashboard Overview**: View system health, active incidents, and key metrics
2. **Services**: Monitor individual microservice health and status
3. **Incidents**: Track and manage detected API failures
4. **Logs**: Explore and filter log entries with advanced search
5. **Metrics**: Visualize performance metrics over time
6. **Deployments**: View deployment history and correlate with incidents
7. **AI Investigation**: Trigger AI-powered root cause analysis for incidents

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/services` - Get all services and their status
- `GET /api/incidents` - Get all incidents
- `GET /api/logs` - Get logs with filtering options
- `GET /api/metrics` - Get metrics data
- `GET /api/deployments` - Get deployment history
- `POST /api/demo/trigger-incident` - Simulate an incident
- `POST /api/demo/reset-incident` - Reset system to healthy state
- `POST /api/incidents/:id/investigate` - Trigger AI investigation
- `POST /api/ai/analyze` - Direct AI analysis endpoint
- `POST /api/ai/recommend-fix` - Get code fix recommendations

## Demo Mode

The application includes a demo mode with simulated incidents. Use the demo controls to:
- Trigger simulated API failures
- Reset the system to a healthy state
- Test AI investigation features

## Project Structure

```
tracemind/
├── backend/              # Python backend (alternative implementation)
├── src/
│   ├── components/      # React components
│   ├── data/           # Mock data and constants
│   ├── services/       # API client
│   ├── types.ts        # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── server.ts           # Express server with Vite integration
├── index.html          # HTML template
└── package.json        # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with Google Gemini AI for intelligent analysis
- UI inspired by modern observability platforms
