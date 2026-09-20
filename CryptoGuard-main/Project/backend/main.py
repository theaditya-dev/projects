import sys
import os

# Make sure this file's own directory (backend/) is on sys.path so that
# `pipeline.*` and `database` resolve correctly no matter what folder
# this script is launched from (workspace root, backend/, run button, etc.)
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from contextlib import asynccontextmanager
import json
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from pipeline.generator import generate_synthetic_dataset
from pipeline.ingestion import parse_and_validate_dataset
from pipeline.graph_clustering import build_entity_graph_and_clusters
from pipeline.network_correlation import analyze_network_chains_and_correlations
from pipeline.features import extract_ml_feature_matrix
from pipeline.ml_engine import run_anomaly_detection_and_scoring
from database import db

def run_full_pipeline(records_data):
    """
    Executes end-to-end analytical pipeline:
    Data Ingestion -> Entity Graph -> Wallet Clustering -> Network Correlation -> Feature Matrix -> ML Anomaly Scoring -> Alerts
    """
    cleaned_records = parse_and_validate_dataset(records_data)
    G, wallet_to_cluster, cluster_metadata = build_entity_graph_and_clusters(cleaned_records)
    tx_to_chain_meta, ip_infra_meta = analyze_network_chains_and_correlations(cleaned_records, wallet_to_cluster)
    feature_matrix, metadata_rows = extract_ml_feature_matrix(cleaned_records, wallet_to_cluster, cluster_metadata, tx_to_chain_meta)
    alerts = run_anomaly_detection_and_scoring(feature_matrix, metadata_rows)
    
    db.store_pipeline_results(cleaned_records, G, wallet_to_cluster, cluster_metadata, alerts)
    return db.get_summary()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Seed system with initial synthetic dataset on startup."""
    synthetic_data = generate_synthetic_dataset(num_records=220)
    run_full_pipeline(synthetic_data)
    yield

app = FastAPI(
    title="CryptoGuard - Bitcoin Investigative AI API",
    version="1.0.0",
    description="Backend API service for AI-powered Bitcoin transaction and network metadata monitoring system.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === API ENDPOINTS (AS PER 04_API_CONTRACT_STARTER.DOCX) ===

@app.post("/api/v1/pipeline/run")
def trigger_pipeline(payload: dict = Body(default={})):
    """Triggers pipeline processing on synthetic data or custom records payload."""
    records = payload.get("records")
    if not records:
        records = generate_synthetic_dataset(num_records=220)
    summary = run_full_pipeline(records)
    return {"status": "success", "message": "Pipeline execution completed successfully.", "summary": summary}

@app.post("/api/v1/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Uploads CSV/JSON dataset and runs analytical pipeline."""
    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON/CSV dataset file format.")
    
    summary = run_full_pipeline(data)
    return {"status": "success", "message": f"Successfully uploaded and analyzed dataset '{file.filename}'.", "summary": summary}

@app.get("/api/v1/dashboard/summary")
def get_dashboard_summary():
    """Returns dashboard KPI statistics."""
    return db.get_summary()

@app.get("/api/v1/alerts")
def get_alerts(severity: Optional[str] = None, search: Optional[str] = None):
    """Returns ranked list of alerts with optional filtering."""
    alerts = db.alerts
    if severity and severity.upper() != "ALL":
        alerts = [a for a in alerts if a["severity"].upper() == severity.upper()]
    if search:
        s = search.lower()
        alerts = [a for a in alerts if s in a["txid"].lower() or s in a["src_ip"].lower() or s in a["primary_wallet"].lower() or s in a["alert_id"].lower()]
    return {"total": len(alerts), "alerts": alerts}

@app.get("/api/v1/alerts/{alert_id}")
def get_alert_details(alert_id: str):
    """Returns full alert investigation details."""
    alert = next((a for a in db.alerts if a["alert_id"] == alert_id or a["txid"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    
    txid = alert["txid"]
    tx = db.transactions.get(txid, {})
    wallet = alert["primary_wallet"]
    entity = db.entities.get(wallet, {})
    
    return {
        "alert": alert,
        "transaction": tx,
        "entity": entity,
        "evidence": {
            "src_ip_infra": alert["src_ip_infra_class"],
            "network_chain_size": alert["network_chain_size"],
            "cluster_id": alert["cluster_id"],
            "cluster_confidence": alert["cluster_confidence"],
            "correlation_flag": alert["correlation_flag"]
        }
    }

@app.get("/api/v1/transactions/{txid}")
def get_transaction_details(txid: str):
    """Returns transaction details."""
    tx = db.transactions.get(txid)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    
    alert = next((a for a in db.alerts if a["txid"] == txid), None)
    return {"transaction": tx, "associated_alert": alert}

@app.get("/api/v1/entity/{entity_id}")
def get_entity_details(entity_id: str):
    """Returns entity (wallet or IP) details."""
    entity = db.entities.get(entity_id)
    if not entity:
        entity = {"id": entity_id, "type": "wallet" if entity_id.startswith("bc1") else "ip", "transactions": []}
        
    related_alerts = [a for a in db.alerts if a["primary_wallet"] == entity_id or a["src_ip"] == entity_id]
    return {"entity": entity, "related_alerts": related_alerts}

@app.get("/api/v1/graph/{entity_id}")
def get_graph(entity_id: str = "all"):
    """Returns graph/subgraph visualization JSON data."""
    if entity_id.lower() in ["all", "root", "full"]:
        return db.graph_data
        
    nodes = [n for n in db.graph_data["nodes"] if n["id"] == entity_id or entity_id in n["id"]]
    node_ids = {n["id"] for n in nodes}
    
    edges = [e for e in db.graph_data["edges"] if e["from"] in node_ids or e["to"] in node_ids]
    for e in edges:
        node_ids.add(e["from"])
        node_ids.add(e["to"])
        
    all_nodes = [n for n in db.graph_data["nodes"] if n["id"] in node_ids]
    return {"nodes": all_nodes, "edges": edges}

@app.get("/api/v1/export")
def export_report():
    """Generates structured investigation summary report."""
    summary = db.get_summary()
    top_alerts = db.alerts[:10]
    return {
        "report_title": "AI-Powered Bitcoin Transaction & Network Investigation Report",
        "generated_at": "2026-08-24T21:46:00Z",
        "summary": summary,
        "critical_leads": top_alerts
    }

# === ALIASES FOR FRONTEND COMPATIBILITY ===
@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats():
    """Alias for dashboard stats."""
    return db.get_summary()

@app.get("/api/v1/entities/{entity_id}")
def get_entities_details_alias(entity_id: str):
    """Alias for /api/v1/entity/{entity_id}."""
    return get_entity_details(entity_id)

@app.get("/api/v1/graph")
def get_graph_default(seed_id: Optional[str] = None):
    """Alias for /api/v1/graph/{seed_id}."""
    return get_graph(seed_id or "all")

@app.post("/api/v1/ingest/upload")
async def upload_dataset_alias(file: UploadFile = File(...)):
    """Alias for /api/v1/upload."""
    return await upload_dataset(file)

# Mount static frontend directory & SPA fallback so direct URL navigation and refreshes work
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
target_static_dir = dist_dir if os.path.exists(dist_dir) else frontend_dir

assets_dir = os.path.join(target_static_dir, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_spa_fallback(full_path: str):
    # Check if exact file exists in static dir (e.g. favicon.svg, robots.txt)
    file_path = os.path.join(target_static_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    # SPA catch-all fallback: serve index.html for React Router
    index_file = os.path.join(target_static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    import uvicorn
    # uvicorn's reload=True spawns a subprocess that imports "main:app" by
    # module name relative to the CURRENT WORKING DIRECTORY (not sys.path[0]).
    # If this script is launched from the Project root instead of backend/,
    # that subprocess fails with "No module named 'main'". Force cwd here so
    # it works no matter where the run button/terminal launched it from.
    os.chdir(_BACKEND_DIR)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
