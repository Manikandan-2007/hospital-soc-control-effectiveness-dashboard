"""
Risk Engine Module
Calculates transparent and explainable hospital cybersecurity risk:
- Baseline Risk (Inherent risk before or without security controls)
- Current Risk (Residual risk factoring in implemented control effectiveness, remediation, and telemetry)
- Risk Reduction % = ((Baseline Risk - Current Risk) / Baseline Risk) * 100
- Risk distribution by Asset Criticality (Critical, High, Medium, Low)
- Granular per-asset risk scores and clinical impact explanations
"""

from typing import Dict, List, Any

# Weight mappings
CRITICALITY_WEIGHTS = {
    "Critical": 1.0,
    "High": 0.75,
    "Medium": 0.45,
    "Low": 0.20
}

SEVERITY_WEIGHTS = {
    "Critical": 1.0,
    "High": 0.75,
    "Medium": 0.45,
    "Low": 0.15
}

def get_risk_tier(score: float) -> str:
    if score >= 81.0:
        return "Critical"
    elif score >= 61.0:
        return "High"
    elif score >= 41.0:
        return "Moderate"
    elif score >= 21.0:
        return "Low"
    else:
        return "Very Low"

class RiskEngine:
    def __init__(self, target_risk: float = 25.0):
        self.target_risk = target_risk

    def calculate_hospital_risk(
        self,
        assets: List[Dict[str, Any]],
        evaluated_controls: List[Dict[str, Any]],
        vulnerabilities: List[Dict[str, Any]],
        incidents: List[Dict[str, Any]],
        remediations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates hospital-wide and per-asset baseline and current risk scores.
        """
        # Index controls by asset
        controls_by_asset = {}
        for c in evaluated_controls:
            aid = c.get("asset_id")
            if aid:
                controls_by_asset.setdefault(aid, []).append(c)

        # Index vulns by asset
        vulns_by_asset = {}
        for v in vulnerabilities:
            aid = v.get("asset_id")
            if aid:
                vulns_by_asset.setdefault(aid, []).append(v)

        # Index incidents by asset
        incidents_by_asset = {}
        for inc in incidents:
            aid = inc.get("asset_id")
            if aid:
                incidents_by_asset.setdefault(aid, []).append(inc)

        asset_risk_profiles = []
        total_baseline_weighted = 0.0
        total_current_weighted = 0.0
        total_asset_weight = 0.0

        # Criticality breakdown accumulators
        criticality_stats = {
            "Critical": {"count": 0, "baseline_sum": 0.0, "current_sum": 0.0},
            "High": {"count": 0, "baseline_sum": 0.0, "current_sum": 0.0},
            "Medium": {"count": 0, "baseline_sum": 0.0, "current_sum": 0.0},
            "Low": {"count": 0, "baseline_sum": 0.0, "current_sum": 0.0}
        }

        for asset in assets:
            aid = asset.get("asset_id")
            crit = asset.get("criticality", "Medium")
            crit_weight = CRITICALITY_WEIGHTS.get(crit, 0.5)

            asset_vulns = vulns_by_asset.get(aid, [])
            asset_incidents = incidents_by_asset.get(aid, [])
            asset_ctrls = controls_by_asset.get(aid, [])

            # --- 1. BASELINE RISK CALCULATION (Inherent exposure) ---
            # Intrinsic vulnerability exposure (max CVSS and volume of vulnerabilities)
            if asset_vulns:
                cvss_scores = [float(v.get("cvss_score", 5.0)) for v in asset_vulns]
                max_cvss = max(cvss_scores)
                avg_cvss = sum(cvss_scores) / len(cvss_scores)
                vuln_inherent = (max_cvss * 6.5) + (avg_cvss * 2.5) + (min(len(asset_vulns), 5) * 2.0)
            else:
                vuln_inherent = 25.0  # Ambient unprofiled baseline

            # Inherent threat exposure based on incident history
            incident_inherent = 0.0
            for inc in asset_incidents:
                s_weight = SEVERITY_WEIGHTS.get(inc.get("severity"), 0.4)
                incident_inherent += (s_weight * 25.0)

            # Combined baseline risk score for this asset (0-100)
            base_score = (crit_weight * 35.0) + (vuln_inherent * 0.45) + min(incident_inherent * 0.20, 20.0)
            baseline_asset_risk = round(max(15.0, min(100.0, base_score)), 1)

            # --- 2. CURRENT RESIDUAL RISK CALCULATION ---
            # Factor in completed control effectiveness
            if asset_ctrls:
                # Average control effectiveness score for this asset
                ctrl_effs = [c.get("effectiveness_score", 0.0) for c in asset_ctrls]
                avg_control_eff = sum(ctrl_effs) / len(ctrl_effs)
                # Controls reduce risk by up to 65% depending on effectiveness
                control_mitigation_ratio = (avg_control_eff / 100.0) * 0.65
            else:
                avg_control_eff = 0.0
                control_mitigation_ratio = 0.0

            # Remediation mitigation for resolved vulnerabilities
            resolved_vulns = [v for v in asset_vulns if v.get("status") in ("Remediated", "Mitigated")]
            unresolved_vulns = [v for v in asset_vulns if v.get("status") not in ("Remediated", "Mitigated")]
            
            if asset_vulns:
                rem_ratio = len(resolved_vulns) / len(asset_vulns)
            else:
                rem_ratio = 1.0

            # Active incidents penalize current risk
            active_incidents = [i for i in asset_incidents if i.get("status") in ("Active", "Investigating", "Open")]
            active_penalty = sum(SEVERITY_WEIGHTS.get(i.get("severity"), 0.5) * 18.0 for i in active_incidents)

            # Residual formula
            mitigated_risk = baseline_asset_risk * (1.0 - control_mitigation_ratio) * (1.0 - (rem_ratio * 0.25))
            current_score = mitigated_risk + active_penalty
            current_asset_risk = round(max(5.0, min(100.0, current_score)), 1)

            # Accumulate hospital-wide
            total_baseline_weighted += (baseline_asset_risk * crit_weight)
            total_current_weighted += (current_asset_risk * crit_weight)
            total_asset_weight += crit_weight

            # Accumulate criticality
            if crit in criticality_stats:
                criticality_stats[crit]["count"] += 1
                criticality_stats[crit]["baseline_sum"] += baseline_asset_risk
                criticality_stats[crit]["current_sum"] += current_asset_risk

            asset_risk_profiles.append({
                "asset_id": aid,
                "asset_name": asset.get("asset_name"),
                "criticality": crit,
                "department": asset.get("department"),
                "baseline_risk": baseline_asset_risk,
                "current_risk": current_asset_risk,
                "reduction_pct": round(((baseline_asset_risk - current_asset_risk) / baseline_asset_risk) * 100.0, 1) if baseline_asset_risk > 0 else 0.0,
                "risk_tier": get_risk_tier(current_asset_risk),
                "unresolved_vulnerabilities": len(unresolved_vulns),
                "active_incidents": len(active_incidents),
                "control_count": len(asset_ctrls),
                "avg_control_effectiveness": round(avg_control_eff, 1)
            })

        # Overall hospital risk
        hospital_baseline = round(total_baseline_weighted / total_asset_weight, 1) if total_asset_weight > 0 else 0.0
        hospital_current = round(total_current_weighted / total_asset_weight, 1) if total_asset_weight > 0 else 0.0
        
        reduction_pct = round(((hospital_baseline - hospital_current) / hospital_baseline) * 100.0, 1) if hospital_baseline > 0 else 0.0

        # Criticality breakdown results
        criticality_breakdown = []
        for tier in ["Critical", "High", "Medium", "Low"]:
            stats = criticality_stats[tier]
            cnt = stats["count"]
            avg_base = round(stats["baseline_sum"] / cnt, 1) if cnt > 0 else 0.0
            avg_curr = round(stats["current_sum"] / cnt, 1) if cnt > 0 else 0.0
            red = round(((avg_base - avg_curr) / avg_base) * 100.0, 1) if avg_base > 0 else 0.0
            criticality_breakdown.append({
                "criticality": tier,
                "asset_count": cnt,
                "baseline_risk": avg_base,
                "current_risk": avg_curr,
                "risk_reduction_pct": red,
                "current_tier": get_risk_tier(avg_curr)
            })

        return {
            "hospital_baseline_risk": hospital_baseline,
            "hospital_current_risk": hospital_current,
            "hospital_target_risk": self.target_risk,
            "risk_reduction_pct": reduction_pct,
            "baseline_tier": get_risk_tier(hospital_baseline),
            "current_tier": get_risk_tier(hospital_current),
            "criticality_breakdown": criticality_breakdown,
            "asset_risk_profiles": sorted(asset_risk_profiles, key=lambda x: x["current_risk"], reverse=True)
        }

if __name__ == "__main__":
    import os
    from data_validator import DataValidator
    from control_effectiveness import ControlEffectivenessEngine

    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
    v = DataValidator(data_dir)
    d = v.validate_all_sources()["data"]
    c_engine = ControlEffectivenessEngine()
    evaluated_ctrls = c_engine.evaluate_controls(
        d["controls"], d["control_telemetry"], d["vulnerabilities"], d["incidents"], d["remediation"]
    )
    r_engine = RiskEngine()
    res = r_engine.calculate_hospital_risk(
        d["assets"], evaluated_ctrls, d["vulnerabilities"], d["incidents"], d["remediation"]
    )
    print(f"Hospital Baseline Risk: {res['hospital_baseline_risk']} ({res['baseline_tier']})")
    print(f"Hospital Current Risk:  {res['hospital_current_risk']} ({res['current_tier']})")
    print(f"Hospital Target Risk:   {res['hospital_target_risk']}")
    print(f"Measured Reduction:     {res['risk_reduction_pct']}%")
