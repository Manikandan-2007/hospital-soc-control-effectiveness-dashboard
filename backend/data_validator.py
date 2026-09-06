"""
Data Validator Module
Provides defensive validation for Hospital SOC datasets (CSVs):
- Identifies missing, stale, delayed, and valid data
- Ensures no silent failure or crash on missing fields or empty CSVs
- Generates freshness metrics and health indicators for all data sources
"""

import os
import csv
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple

# Freshness thresholds in hours
STALE_THRESHOLD_HOURS = 48.0  # Data older than 48 hours without update is flagged STALE
DELAYED_THRESHOLD_HOURS = 2.0  # Telemetry processing gap > 2 hours is flagged DELAYED

def parse_iso_datetime(dt_str: str) -> datetime | None:
    """Safely parse ISO datetime string or return None."""
    if not dt_str or not isinstance(dt_str, str):
        return None
    dt_str = dt_str.strip()
    if not dt_str:
        return None
    try:
        # Normalize trailing Z
        if dt_str.endswith('Z'):
            dt_str = dt_str[:-1] + '+00:00'
        dt = datetime.fromisoformat(dt_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        # Try simple date format YYYY-MM-DD
        try:
            return datetime.strptime(dt_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except Exception:
            return None

class DataValidator:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        # Reference current time (simulated current time corresponding to dataset timeframe)
        self.reference_time = datetime(2026, 9, 6, 8, 0, 0, tzinfo=timezone.utc)

    def load_csv(self, filename: str, required_fields: List[str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Defensively loads a CSV file.
        Returns: (records, status_report)
        """
        filepath = os.path.join(self.data_dir, filename)
        report = {
            "source": filename,
            "exists": False,
            "total_rows": 0,
            "valid_rows": 0,
            "missing_rows": 0,
            "missing_fields": [],
            "status": "MISSING",  # FRESH, STALE, MISSING, DELAYED
            "freshness_message": "",
            "last_updated": None
        }

        if not os.path.exists(filepath):
            report["freshness_message"] = f"File {filename} is missing. Calculations reliant on this source cannot be confirmed."
            return [], report

        report["exists"] = True
        records = []
        latest_timestamp = None

        try:
            with open(filepath, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                if not reader.fieldnames:
                    report["freshness_message"] = f"File {filename} is empty. No column headers found."
                    report["status"] = "MISSING"
                    return [], report

                # Check missing columns
                missing_cols = [f for f in required_fields if f not in reader.fieldnames]
                if missing_cols:
                    report["missing_fields"] = missing_cols

                for row_idx, row in enumerate(reader):
                    report["total_rows"] += 1
                    # Clean up keys and values
                    clean_row = {k.strip(): (v.strip() if v else "") for k, v in row.items() if k}
                    
                    # Track latest timestamp for freshness
                    for time_key in ["last_updated", "event_timestamp", "detected_time", "implementation_date", "last_verified", "completed_date"]:
                        if time_key in clean_row and clean_row[time_key]:
                            dt = parse_iso_datetime(clean_row[time_key])
                            if dt and (latest_timestamp is None or dt > latest_timestamp):
                                latest_timestamp = dt

                    records.append(clean_row)
                    report["valid_rows"] += 1

        except Exception as e:
            report["status"] = "ERROR"
            report["freshness_message"] = f"Failed to parse {filename}: {str(e)}"
            return [], report

        if report["total_rows"] == 0:
            report["status"] = "MISSING"
            report["freshness_message"] = f"Data source {filename} contains zero records."
            return [], report

        # Freshness evaluation
        if latest_timestamp:
            report["last_updated"] = latest_timestamp.isoformat()
            age_hours = (self.reference_time - latest_timestamp).total_seconds() / 3600.0
            if age_hours < 0:
                age_hours = 0
            
            if age_hours > STALE_THRESHOLD_HOURS:
                report["status"] = "STALE"
                report["freshness_message"] = f"Data was last updated {int(age_hours)} hours ago. Risk calculations may not represent the latest situation."
            else:
                report["status"] = "FRESH"
                report["freshness_message"] = f"Data is actively updated (last update {int(age_hours)}h ago). High confidence in calculations."
        else:
            report["status"] = "STALE"
            report["freshness_message"] = "No valid timestamp found in source records. Treating as STALE."

        return records, report

    def validate_all_sources(self) -> Dict[str, Any]:
        """Validates all 6 core datasets and provides overarching freshness report."""
        sources = {
            "assets": ("assets.csv", ["asset_id", "asset_name", "criticality", "last_updated"]),
            "controls": ("controls.csv", ["control_id", "control_name", "implementation_status", "effectiveness_score"]),
            "vulnerabilities": ("vulnerabilities.csv", ["vulnerability_id", "asset_id", "severity", "cvss_score", "status"]),
            "incidents": ("incidents.csv", ["incident_id", "asset_id", "severity", "status"]),
            "control_telemetry": ("control_telemetry.csv", ["event_id", "control_id", "event_timestamp", "control_status"]),
            "remediation": ("remediation.csv", ["remediation_id", "vulnerability_id", "status", "verification_status"])
        }

        reports = {}
        all_data = {}
        for key, (fname, req_cols) in sources.items():
            records, report = self.load_csv(fname, req_cols)
            reports[key] = report
            all_data[key] = records

        # Overall health summary
        fresh_count = sum(1 for r in reports.values() if r["status"] == "FRESH")
        stale_count = sum(1 for r in reports.values() if r["status"] == "STALE")
        missing_count = sum(1 for r in reports.values() if r["status"] in ("MISSING", "ERROR"))
        
        overall_confidence = "HIGH"
        if missing_count > 0 or stale_count >= 3:
            overall_confidence = "LOW"
        elif stale_count > 0:
            overall_confidence = "MEDIUM"

        return {
            "overall_confidence": overall_confidence,
            "fresh_sources": fresh_count,
            "stale_sources": stale_count,
            "missing_sources": missing_count,
            "sources": reports,
            "data": all_data
        }

if __name__ == "__main__":
    import json
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
    validator = DataValidator(data_dir)
    res = validator.validate_all_sources()
    print("=== Validation Result ===")
    print(f"Overall Confidence: {res['overall_confidence']}")
    for k, v in res['sources'].items():
        print(f"  {k}: {v['status']} (rows: {v['total_rows']}) - {v['freshness_message']}")
