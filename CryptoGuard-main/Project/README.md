# CryptoGuard // Bitcoin Forensic Intelligence & Correlation Platform
### AI-Powered Bitcoin Transaction Traffic Monitoring & Two-Layer Forensic Correlation

---

## 🏛️ System Architecture

```
Project/
├── backend/                  ← TEAM 2 BACKEND & TEAM 1 AI/ML PIPELINE
│   ├── pipeline/             ← Team 1 Analytical Engine
│   │   ├── features.py       ← Feature Matrix Extraction (7 Core Features)
│   │   ├── generator.py      ← Synthetic Forensic Dataset Generator
│   │   ├── graph_clustering.py ← Common-Input-Ownership Clustering & Graph Builder
│   │   ├── ingestion.py      ← Data Ingestion & Sanitization
│   │   ├── ml_engine.py      ← Isolation Forest Anomaly Detection & Scoring
│   │   └── network_correlation.py ← Two-Layer IP/P2P & Chain Correlation
│   ├── database.py           ← In-Memory Forensic Data Store & Vis.js Converter
│   ├── main.py               ← FastAPI High-Throughput REST Service
│   └── requirements.txt      ← Python Dependencies
│
├── frontend/                 ← TEAM 3 GLASSMORPHISM INVESTIGATION UI
│   ├── public/               ← Static Assets & Favicons
│   ├── src/
│   │   ├── api/              ← Unified API Gateway & Mock/Live Adapters
│   │   ├── assets/styles/    ← Design Tokens & Glassmorphism Global Styles
│   │   ├── components/       ← Reusable Glass UI, Radar KPIs & Forensic Graph Canvas
│   │   ├── pages/            ← Dashboard, Alerts, Graph, Investigation, Upload, Reports
│   │   └── types/            ← Strict Forensic Domain Models & API Contracts
│   ├── .env                  ← Environment Configuration
│   ├── package.json          ← Frontend Dependencies (React 18, Vite, Lucide, Tailwind)
│   └── vite.config.ts        ← Vite Bundler Configuration
│
├── run_pipeline.py           ← One-Click Standalone Full-Stack Engine
├── run_pipeline.bat          ← Windows Launcher for Full-Stack Engine
├── start_dev.bat             ← Concurrent Developer Launcher (Backend + Frontend HMR)
└── 01-04 Project Docs        ← Problem Statement Specifications & API Contracts
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Full-Stack Launch (Production Bundle)
To start the integrated AI/ML pipeline, backend server, and serve the React UI on `http://127.0.0.1:8000`:
```cmd
start.bat
```
*(or run `python run_pipeline.py`)*

### Option 2: Active Development Mode (Live Hot Reloading)
To run the FastAPI backend and Vite React development server concurrently:
```cmd
start_dev.bat
```
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ⚙️ Environment Configuration

Edit [`frontend/.env`](file:///d:/Final_Project/Project/frontend/.env):

| Variable | Default | Description |
|---|---|---|
| `VITE_USE_MOCK` | `true` | Set to `false` to communicate directly with live FastAPI backend on port 8000. Set to `true` for standalone mock mode. |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend REST API base endpoint |
| `VITE_APP_TITLE` | `CryptoGuard Forensics` | Application brand title |

---

## 📊 Core Forensic Capabilities

1. **Two-Layer Traffic Correlation**: Maps transaction broadcast times and UTXO flows to network layer source IPs and infrastructure (Tor exits, VPNs, datacenters).
2. **Common-Input-Ownership Heuristic**: Clusters multi-input transactions into identifiable entity wallets with cluster confidence ratings.
3. **Multi-Model Anomaly Detection**: Isolation Forest outlier detection calibrated on fee rates, UTXO count spikes, volume deviations, and network anomalies.
4. **Interactive Glassmorphic Graph**: Visualizes wallet clusters, transaction flow, and peer network infrastructure with dynamic filtering and risk indicators.
5. **Dossier Export**: Generates courtroom-ready forensic reports detailing transaction provenance and telemetry evidence.
