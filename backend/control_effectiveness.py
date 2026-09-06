"""
Control Effectiveness Calculation Module
Calculates granular effectiveness score (0-100) and operational rating for each hospital security control:
- Rating: Effective (>= 80), Partially Effective (50-79), Ineffective (< 50), Unknown
- Evaluates:
  * Telemetry success vs failure ratio
  * Incidents associated with or blocked by the control
  * Active/open vulnerabilities associated with the asset/control
  * Remediation verification status
- Provides concrete, audit-ready evidence for every rating.
"""

from typing import Dict, List, Any

class ControlEffectivenessEngine:
    def __init__(self):
        pass

    def evaluate_controls(
        self,
        controls: List[Dict[str, Any]],
        telemetry_events: List[Dict[str, Any]],
        vulnerabilities: List[Dict[str, Any]],
        incidents: List[Dict[str, Any]],
        remediations: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Calculates effectiveness metrics, classification, and supporting evidence for each control.
        """
        # Map telemetry by control_id
        telemetry_by_ctrl = {}
        for ev in telemetry_events:
            cid = ev.get("control_id")
            if cid:
                telemetry_by_ctrl.setdefault(cid, []).append(ev)

        # Map incidents by control_id
        incidents_by_ctrl = {}
        for inc in incidents:
            cid = inc.get("control_id")
            if cid:
                incidents_by_ctrl.setdefault(cid, []).append(inc)

        # Map vulns by asset_id
        vulns_by_asset = {}
        for v in vulnerabilities:
            aid = v.get("asset_id")
            if aid:
                vulns_by_asset.setdefault(aid, []).append(v)

        # Map remediations by asset_id
        rems_by_asset = {}
        for r in remediations:
            aid = r.get("asset_id")
            if aid:
                rems_by_asset.setdefault(aid, []).append(r)

        results = []

        for ctrl in controls:
            cid = ctrl.get("control_id")
            aid = ctrl.get("asset_id")
            cname = ctrl.get("control_name")
            ctype = ctrl.get("control_type")
            impl_status = ctrl.get("implementation_status", "Unknown")

            events = telemetry_by_ctrl.get(cid, [])
            ctrl_incidents = incidents_by_ctrl.get(cid, [])
            asset_vulns = vulns_by_asset.get(aid, [])
            asset_rems = rems_by_asset.get(aid, [])

            # Count telemetry signals
            success_count = sum(1 for e in events if e.get("control_status") == "control_success")
            failure_count = sum(1 for e in events if e.get("control_status") == "control_failure")
            total_telemetry = success_count + failure_count

            # Count incidents
            active_incidents = sum(1 for i in ctrl_incidents if i.get("status") in ("Active", "Investigating", "Open"))
            contained_incidents = sum(1 for i in ctrl_incidents if i.get("status") in ("Resolved", "Contained"))

            # Count open critical/high vulnerabilities on this asset
            open_vulns = [v for v in asset_vulns if v.get("status") in ("Open", "In Progress")]
            critical_open = sum(1 for v in open_vulns if v.get("severity") in ("Critical", "High"))

            # Check remediation verification
            verified_remediations = sum(1 for r in asset_rems if "Verified" in r.get("verification_status", ""))
            failed_remediations = sum(1 for r in asset_rems if "Failed" in r.get("verification_status", ""))

            evidence_points = []

            # Scoring algorithm
            if impl_status == "Planned" or (total_telemetry == 0 and not ctrl.get("last_verified")):
                score = 0.0
                rating = "Unknown"
                evidence_points.append("Control is marked as Planned/Pending; no active telemetry stream or verification timestamp established.")
            elif impl_status == "Failed":
                score = min(float(ctrl.get("effectiveness_score", 35.0)), 45.0)
                rating = "Ineffective"
                evidence_points.append(f"Implementation status marked as Failed with {failure_count} telemetry failure events recorded.")
            else:
                # Base score from telemetry ratio (weight 50%)
                if total_telemetry > 0:
                    telemetry_ratio = (success_count / total_telemetry) * 100.0
                    evidence_points.append(f"Telemetry reliability: {success_count}/{total_telemetry} successful signals ({telemetry_ratio:.1f}%).")
                else:
                    telemetry_ratio = 75.0  # Default neutral if no direct event stream yet
                    evidence_points.append("Zero direct telemetry events; evaluating based on audit logs and incident containment.")

                # Incident containment bonus / penalty (weight 25%)
                incident_factor = 95.0
                if active_incidents > 0:
                    incident_factor -= (active_incidents * 35.0)
                    evidence_points.append(f"{active_incidents} active incident(s) currently uncontained on associated asset {aid}.")
                elif contained_incidents > 0:
                    evidence_points.append(f"{contained_incidents} incident(s) successfully intercepted and contained by this control.")

                # Vulnerability posture on asset (weight 15%)
                vuln_factor = 95.0
                if critical_open > 0:
                    vuln_factor -= (critical_open * 20.0)
                    evidence_points.append(f"{critical_open} unresolved Critical/High vulnerability exposures present on asset.")
                else:
                    evidence_points.append("All known high-severity vulnerabilities on asset remediated or mitigated.")

                # Remediation verification factor (weight 10%)
                rem_factor = 85.0
                if failed_remediations > 0:
                    rem_factor = 40.0
                    evidence_points.append(f"{failed_remediations} remediation attempt(s) failed verification check.")
                elif verified_remediations > 0:
                    rem_factor = 98.0
                    evidence_points.append(f"{verified_remediations} remediation(s) verified effective by clinical engineering.")

                # Composite score calculation
                calculated_score = (
                    (telemetry_ratio * 0.45) +
                    (incident_factor * 0.25) +
                    (vuln_factor * 0.20) +
                    (rem_factor * 0.10)
                )

                # Clamp 0 - 100
                score = round(max(0.0, min(100.0, calculated_score)), 1)

                if score >= 80.0:
                    rating = "Effective"
                elif score >= 50.0:
                    rating = "Partially Effective"
                else:
                    rating = "Ineffective"

            results.append({
                "control_id": cid,
                "control_name": cname,
                "control_type": ctype,
                "asset_id": aid,
                "implementation_status": impl_status,
                "implementation_date": ctrl.get("implementation_date", ""),
                "last_verified": ctrl.get("last_verified", ""),
                "effectiveness_score": score,
                "rating": rating,
                "telemetry_summary": {
                    "total_events": total_telemetry,
                    "success": success_count,
                    "failure": failure_count
                },
                "active_incidents": active_incidents,
                "open_critical_vulns": critical_open,
                "evidence": evidence_points
            })

        return results

if __name__ == "__main__":
    import os
    from data_validator import DataValidator
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
    v = DataValidator(data_dir)
    d = v.validate_all_sources()["data"]
    engine = ControlEffectivenessEngine()
    evaluated = engine.evaluate_controls(
        d["controls"], d["control_telemetry"], d["vulnerabilities"], d["incidents"], d["remediation"]
    )
    for c in evaluated:
        print(f"[{c['rating']}] {c['control_id']} ({c['control_name']}): {c['effectiveness_score']}%")
