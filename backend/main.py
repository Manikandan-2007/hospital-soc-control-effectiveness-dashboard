"""
Hospital SOC Control Effectiveness & Business Risk Dashboard - FastAPI Backend Entrypoint
Exposes RESTful endpoints for:
- /api/overview: Top KPI metrics, hospital risk summaries, confidence status
- /api/controls: Control effectiveness scores, ratings, and audit evidence
- /api/risks: Risk trend, baseline vs current, asset criticality distributions
- /api/assets: Comprehensive inventory of medical devices & clinical apps
- /api/vulnerabilities: Detected CVEs, CVSS scores, remediation status
- /api/incidents: Active and resolved security incidents
- /api/remediation: Remediation actions, verification statuses, assigned teams
- /api/freshness: Data health diagnostics across all 6 data feeds
- /api/evidence/{entity_id}: Comprehensive drill-down chain for any asset or control
- /api/recommendations: Explainable, rule-based clinical business recommendations
- /api/baseline-experiment: Empirical baseline vs current risk experiment results
- /api/simulate-event: Dynamic anomaly injection (duplicate, delayed, out-of-order)
"""

import os
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data_validator import DataValidator
from event_processor import EventProcessor
from control_effectiveness import ControlEffectivenessEngine
from risk_engine import RiskEngine
from recommendation_engine import RecommendationEngine
from baseline_experiment import BaselineExperiment

app = FastAPI(
    title="Hospital SOC Control Effectiveness & Business Risk API",
    version="1.0.0",
    description="Translates technical cybersecurity telemetry into clinical business risk reduction metrics."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
validator = DataValidator(DATA_DIR)
event_processor = EventProcessor()
control_engine = ControlEffectivenessEngine()
risk_engine = RiskEngine(target_risk=25.0)
rec_engine = RecommendationEngine()
experiment_runner = BaselineExperiment(DATA_DIR)

class SimulateEventRequest(BaseModel):
    anomaly_type: str  # 'duplicate', 'delayed', 'out_of_order'

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Hospital SOC Backend API"}

@app.get("/api/overview")
def get_overview(role: Optional[str] = Query("management")):
    """Returns top KPI metrics and overview customized by user role."""
    val_res = validator.validate_all_sources()
    data = val_res["data"]
    
    processed_events = event_processor.process_telemetry_batch(data["control_telemetry"])
    evaluated_ctrls = control_engine.evaluate_controls(
        data["controls"], processed_events["events"], data["vulnerabilities"], data["incidents"], data["remediation"]
    )
    risk_summary = risk_engine.calculate_hospital_risk(
        data["assets"], evaluated_ctrls, data["vulnerabilities"], data["incidents"], data["remediation"]
    )
    
    effective_count = sum(1 for c in evaluated_ctrls if c["rating"] == "Effective")
    partial_count = sum(1 for c in evaluated_ctrls if c["rating"] == "Partially Effective")
    ineffective_count = sum(1 for c in evaluated_ctrls if c["rating"] == "Ineffective")
    
    critical_assets = sum(1 for a in data["assets"] if a.get("criticality") == "Critical")
    open_crit_vulns = sum(1 for v in data["vulnerabilities"] if v.get("severity") == "Critical" and v.get("status") in ("Open", "In Progress"))
    active_incidents = sum(1 for i in data["incidents"] if i.get("status") in ("Active", "Investigating", "Open"))

    avg_control_eff = round(sum(c["effectiveness_score"] for c in evaluated_ctrls) / len(evaluated_ctrls), 1) if evaluated_ctrls else 0.0

    return {
        "role": role,
        "kpis": {
            "baseline_risk": risk_summary["hospital_baseline_risk"],
            "current_risk": risk_summary["hospital_current_risk"],
            "risk_reduction_pct": risk_summary["risk_reduction_pct"],
            "target_risk": risk_summary["hospital_target_risk"],
            "control_effectiveness_avg": avg_control_eff,
            "critical_assets_count": critical_assets,
            "open_critical_vulns_count": open_crit_vulns,
            "active_incidents_count": active_incidents,
            "data_confidence": val_res["overall_confidence"]
        },
        "control_breakdown": {
            "effective": effective_count,
            "partially_effective": partial_count,
            "ineffective": ineffective_count,
            "total": len(evaluated_ctrls)
        },
        "risk_summary": risk_summary,
        "freshness": {
            "overall_confidence": val_res["overall_confidence"],
            "sources": val_res["sources"]
        }
    }

@app.get("/api/controls")
def get_controls():
    val_res = validator.validate_all_sources()
    data = val_res["data"]
    processed = event_processor.process_telemetry_batch(data["control_telemetry"])
    return control_engine.evaluate_controls(
        data["controls"], processed["events"], data["vulnerabilities"], data["incidents"], data["remediation"]
    )

@app.get("/api/risks")
def get_risks():
    val_res = validator.validate_all_sources()
    data = val_res["data"]
    processed = event_processor.process_telemetry_batch(data["control_telemetry"])
    ctrls = control_engine.evaluate_controls(
        data["controls"], processed["events"], data["vulnerabilities"], data["incidents"], data["remediation"]
    )
    return risk_engine.calculate_hospital_risk(
        data["assets"], ctrls, data["vulnerabilities"], data["incidents"], data["remediation"]
    )

@app.get("/api/assets")
def get_assets():
    val_res = validator.validate_all_sources()
    return val_res["data"]["assets"]

@app.get("/api/vulnerabilities")
def get_vulnerabilities():
    val_res = validator.validate_all_sources()
    return val_res["data"]["vulnerabilities"]

@app.get("/api/incidents")
def get_incidents():
    val_res = validator.validate_all_sources()
    return val_res["data"]["incidents"]

@app.get("/api/remediation")
def get_remediation():
    val_res = validator.validate_all_sources()
    return val_res["data"]["remediation"]

@app.get("/api/freshness")
def get_freshness():
    val_res = validator.validate_all_sources()
    return val_res

@app.get("/api/recommendations")
def get_recommendations():
    val_res = validator.validate_all_sources()
    data = val_res["data"]
    processed = event_processor.process_telemetry_batch(data["control_telemetry"])
    ctrls = control_engine.evaluate_controls(
        data["controls"], processed["events"], data["vulnerabilities"], data["incidents"], data["remediation"]
    )
    risk_summary = risk_engine.calculate_hospital_risk(
        data["assets"], ctrls, data["vulnerabilities"], data["incidents"], data["remediation"]
    )
    return rec_engine.generate_recommendations(
        risk_summary, ctrls, data["vulnerabilities"], data["incidents"], data["assets"], val_res
    )

@app.get("/api/baseline-experiment")
def get_baseline_experiment():
    return experiment_runner.run_experiment()

@app.get("/api/evidence/{entity_id}")
def get_evidence(entity_id: str):
    """
    Returns full evidence graph for an asset, control, vulnerability, or incident.
    """
    val_res = validator.validate_all_sources()
    data = val_res["data"]
    processed = event_processor.process_telemetry_batch(data["control_telemetry"])
    ctrls = control_engine.evaluate_controls(
        data["controls"], processed["events"], data["vulnerabilities"], data["incidents"], data["remediation"]
    )

    # Check if entity is an asset
    asset = next((a for a in data["assets"] if a.get("asset_id") == entity_id), None)
    if asset:
        aid = entity_id
        matched_ctrls = [c for c in ctrls if c.get("asset_id") == aid]
        matched_vulns = [v for v in data["vulnerabilities"] if v.get("asset_id") == aid]
        matched_incidents = [i for i in data["incidents"] if i.get("asset_id") == aid]
        matched_telemetry = [t for t in processed["events"] if t.get("asset_id") == aid]
        matched_remediation = [r for r in data["remediation"] if r.get("asset_id") == aid]

        return {
            "entity_type": "asset",
            "entity_id": entity_id,
            "asset": asset,
            "controls": matched_ctrls,
            "vulnerabilities": matched_vulns,
            "incidents": matched_incidents,
            "telemetry": matched_telemetry,
            "remediation": matched_remediation
        }

    # Check if entity is a control
    control = next((c for c in ctrls if c.get("control_id") == entity_id), None)
    if control:
        aid = control.get("asset_id")
        parent_asset = next((a for a in data["assets"] if a.get("asset_id") == aid), None)
        matched_telemetry = [t for t in processed["events"] if t.get("control_id") == entity_id]
        matched_incidents = [i for i in data["incidents"] if i.get("control_id") == entity_id]

        return {
            "entity_type": "control",
            "entity_id": entity_id,
            "control": control,
            "asset": parent_asset,
            "telemetry": matched_telemetry,
            "incidents": matched_incidents
        }

    raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found in asset or control records.")

@app.post("/api/simulate-event")
def simulate_event(req: SimulateEventRequest):
    val_res = validator.validate_all_sources()
    raw_telemetry = val_res["data"]["control_telemetry"]
    res = event_processor.inject_simulated_event(req.anomaly_type, raw_telemetry)
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
