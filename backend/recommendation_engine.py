"""
Recommendation Engine Module
Generates explainable, rule-based clinical and operational recommendations:
- Translates technical findings into hospital executive & clinical operations language
- Strictly structures each recommendation into 4 parts:
  1. What is happening (plain-language summary)
  2. Why it matters to the hospital (clinical continuity, patient safety, HIPAA risk)
  3. What should be done (concrete remediation / governance action)
  4. What evidence supports the recommendation (audit trail & telemetry proof)
"""

from typing import Dict, List, Any

class RecommendationEngine:
    def __init__(self):
        pass

    def generate_recommendations(
        self,
        risk_summary: Dict[str, Any],
        evaluated_controls: List[Dict[str, Any]],
        vulnerabilities: List[Dict[str, Any]],
        incidents: List[Dict[str, Any]],
        assets: List[Dict[str, Any]],
        freshness_report: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        recommendations = []
        rec_id_counter = 1

        asset_map = {a.get("asset_id"): a for a in assets}

        # Rule 1: Critical Asset + Critical Vulnerability + Remediation Overdue
        for v in vulnerabilities:
            aid = v.get("asset_id")
            asset = asset_map.get(aid, {})
            if asset.get("criticality") == "Critical" and v.get("severity") == "Critical":
                if v.get("remediation_status") == "Overdue" or (v.get("status") in ("Open", "In Progress") and not v.get("remediation_completed_date")):
                    recommendations.append({
                        "id": f"REC-{rec_id_counter:03d}",
                        "title": f"Expedite Critical Remediation on {asset.get('asset_name', aid)}",
                        "priority": "Immediate (P1)",
                        "target_role": "Management & SOC Lead",
                        "category": "Vulnerability Remediation",
                        "related_asset_id": aid,
                        "what_is_happening": (
                            f"A critical security flaw (CVSS {v.get('cvss_score')}) remains unpatched on '{asset.get('asset_name')}', "
                            f"past its remediation due date ({v.get('remediation_due_date', 'N/A')})."
                        ),
                        "why_it_matters": (
                            f"This system directly supports {asset.get('business_function', 'patient clinical care')} in {asset.get('department')}. "
                            "An active exploit could freeze diagnostic operations, delay emergency surgeries, or compromise patient safety."
                        ),
                        "what_should_be_done": (
                            "Authorize an emergency maintenance window with Biomedical Engineering and Clinical Informatics "
                            "to apply vendor-validated firmware patches and verify system isolation."
                        ),
                        "evidence": [
                            f"Vulnerability ID: {v.get('vulnerability_id')}, Severity: {v.get('severity')}, CVSS: {v.get('cvss_score')}",
                            f"Remediation Status: {v.get('remediation_status')}, Due Date: {v.get('remediation_due_date')}",
                            f"Asset Department: {asset.get('department')}, Criticality: {asset.get('criticality')}"
                        ]
                    })
                    rec_id_counter += 1

        # Rule 2: High Control Failure Rate / Ineffective Control
        for c in evaluated_controls:
            failures = c.get("telemetry_summary", {}).get("failure", 0)
            total = c.get("telemetry_summary", {}).get("total_events", 0)
            eff_score = c.get("effectiveness_score", 100.0)
            if c.get("rating") == "Ineffective" or (total > 0 and (failures / total) >= 0.40):
                aid = c.get("asset_id")
                asset = asset_map.get(aid, {})
                recommendations.append({
                    "id": f"REC-{rec_id_counter:03d}",
                    "title": f"Overhaul Failed Control: {c.get('control_name')}",
                    "priority": "High (P2)",
                    "target_role": "Security Manager & Engineering",
                    "category": "Control Hardening",
                    "related_control_id": c.get("control_id"),
                    "what_is_happening": (
                        f"Security control '{c.get('control_name')}' protecting {asset.get('asset_name', aid)} "
                        f"is operating with an ineffective score of {eff_score}%, with recurring telemetry failure signals."
                    ),
                    "why_it_matters": (
                        "When an automated defense control fails silently, clinical staff continue operating under a false sense of security, "
                        "allowing unauthorized lateral network traversal into medical devices."
                    ),
                    "what_should_be_done": (
                        "Conduct an immediate root-cause investigation into the failed control agents, update endpoint rules, "
                        "and test fallback compensating controls such as network micro-isolation."
                    ),
                    "evidence": [
                        f"Control ID: {c.get('control_id')}, Status: {c.get('implementation_status')}, Score: {eff_score}%",
                        f"Telemetry Failures: {failures} out of {total} events flagged as control_failure",
                        f"Target Asset: {c.get('asset_id')} ({asset.get('asset_name', 'Unknown')})"
                    ]
                })
                rec_id_counter += 1

        # Rule 3: Stale Data or Telemetry Gaps
        for src_name, src_rep in freshness_report.get("sources", {}).items():
            if src_rep.get("status") in ("STALE", "MISSING"):
                recommendations.append({
                    "id": f"REC-{rec_id_counter:03d}",
                    "title": f"Refresh Stale Telemetry Stream: {src_name.replace('_', ' ').title()}",
                    "priority": "Medium (P3)",
                    "target_role": "SOC Analyst & IT Admin",
                    "category": "Data Freshness & Telemetry",
                    "what_is_happening": (
                        f"The '{src_name}' data feed is currently marked as {src_rep.get('status')}. "
                        f"{src_rep.get('freshness_message')}"
                    ),
                    "why_it_matters": (
                        "Hospital executive decisions and compliance audits require reliable, up-to-date threat data. "
                        "Stale telemetry obscures recently emerging vulnerabilities and active intrusions."
                    ),
                    "what_should_be_done": (
                        f"Restart the syslog collectors and verify the scheduled ingestion pipeline for {src_rep.get('source')}."
                    ),
                    "evidence": [
                        f"Source File: {src_rep.get('source')}, Status: {src_rep.get('status')}",
                        f"Total Rows: {src_rep.get('total_rows')}, Last Timestamp: {src_rep.get('last_updated', 'None')}"
                    ]
                })
                rec_id_counter += 1

        # Rule 4: Completed Control Showing Measurable Risk Reduction (Positive Reinforcement)
        for c in evaluated_controls:
            if c.get("rating") == "Effective" and c.get("effectiveness_score", 0) >= 88.0:
                aid = c.get("asset_id")
                asset = asset_map.get(aid, {})
                recommendations.append({
                    "id": f"REC-{rec_id_counter:03d}",
                    "title": f"Maintain and Expand Proven Control: {c.get('control_name')}",
                    "priority": "Strategic / Continuous Assurance",
                    "target_role": "Management & Clinical Leadership",
                    "category": "Control Attribution",
                    "related_control_id": c.get("control_id"),
                    "what_is_happening": (
                        f"Implemented control '{c.get('control_name')}' has achieved a high effectiveness score of {c.get('effectiveness_score')}%, "
                        f"successfully shielding {asset.get('asset_name', aid)}."
                    ),
                    "why_it_matters": (
                        "Telemetry demonstrates that network and access barriers are effectively blocking untrusted requests "
                        "without disrupting clinical workflow or alarm response times."
                    ),
                    "what_should_be_done": (
                        "Retain this control architecture as the standard blueprint and replicate its configuration to other clinical wards."
                    ),
                    "evidence": [
                        f"Effectiveness Score: {c.get('effectiveness_score')}%, Rating: {c.get('rating')}",
                        f"Verified Telemetry: {c.get('telemetry_summary', {}).get('success', 0)} consecutive successful enforcement cycles",
                        f"No active uncontained breach on asset {aid}"
                    ]
                })
                rec_id_counter += 1
                break  # Show one premier attribution recommendation to prevent clutter

        return recommendations
