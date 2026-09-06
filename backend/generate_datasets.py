#!/usr/bin/env python3
"""
Synthetic Dataset Generator for Hospital SOC Control Effectiveness & Business Risk Dashboard.
Generates realistic hospital SOC datasets with realistic data quality imperfections:
- delayed events
- duplicate events
- out-of-order events
- missing values
- stale records
"""

import os
import csv
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Fixed seed for reproducible baseline
random.seed(42)

BASE_TIME = datetime(2026, 9, 1, 8, 0, 0)

# 1. ASSETS
ASSETS = [
    {
        "asset_id": "AST-ICU-001",
        "asset_name": "Mindray BeneVision N22 Central Monitor",
        "asset_type": "ICU monitoring systems",
        "department": "Intensive Care Unit",
        "criticality": "Critical",
        "business_function": "Real-time continuous patient telemetry and arrhythmia alarm generation",
        "location": "Tower B, Floor 4, ICU Bed Cluster 1-12",
        "owner": "Dr. Aris Thorne (Chief of Critical Care)",
        "last_updated": "2026-09-05T14:30:00Z"
    },
    {
        "asset_id": "AST-ICU-002",
        "asset_name": "Philips IntelliVue MX800 Patient Monitor",
        "asset_type": "Patient monitoring devices",
        "department": "Intensive Care Unit",
        "criticality": "Critical",
        "business_function": "Hemodynamic bedside patient vitals tracking",
        "location": "Tower B, Floor 4, ICU Bed Cluster 13-24",
        "owner": "Dr. Aris Thorne (Chief of Critical Care)",
        "last_updated": "2026-09-04T10:15:00Z"
    },
    {
        "asset_id": "AST-INF-001",
        "asset_name": "Baxter Spectrum IQ Infusion Pump Gateway",
        "asset_type": "Infusion pumps",
        "department": "General Medicine & Oncology",
        "criticality": "Critical",
        "business_function": "Automated IV medication dose verification and infusion rate control",
        "location": "North Wing, Floor 3, MedSurg Station A",
        "owner": "Sarah Lin, PharmD (Clinical Pharmacy Director)",
        "last_updated": "2026-09-05T18:00:00Z"
    },
    {
        "asset_id": "AST-MRI-001",
        "asset_name": "Siemens Magnetom Vida 3T MRI Suite",
        "asset_type": "MRI systems",
        "department": "Radiology",
        "criticality": "High",
        "business_function": "High-field magnetic resonance diagnostic neuro and cardiac imaging",
        "location": "Basement 1, Imaging Bay 2",
        "owner": "Marcus Vance (Director of Medical Imaging)",
        "last_updated": "2026-09-03T09:00:00Z"
    },
    {
        "asset_id": "AST-CTS-001",
        "asset_name": "GE Revolution Apex CT Scanner",
        "asset_type": "CT scanners",
        "department": "Emergency & Trauma",
        "criticality": "Critical",
        "business_function": "Rapid trauma triage whole-body computed tomography scan",
        "location": "Emergency Pavilion, Bay 1",
        "owner": "Dr. Karen O'Connor (Emergency Medicine Dept)",
        "last_updated": "2026-09-05T20:45:00Z"
    },
    {
        "asset_id": "AST-EHR-001",
        "asset_name": "Epic Systems Hyperspace Production Cluster",
        "asset_type": "Electronic Health Record applications",
        "department": "Information Technology / Clinical Informatics",
        "criticality": "Critical",
        "business_function": "Central patient charts, CPOE orders, billing, clinical notes, and medication administration",
        "location": "Primary Data Center, Rack 14A-16B",
        "owner": "Elena Rostova (Chief Information Officer)",
        "last_updated": "2026-09-06T00:30:00Z"
    },
    {
        "asset_id": "AST-PHR-001",
        "asset_name": "BD Pyxis MedStation Enterprise Dispensing Server",
        "asset_type": "Pharmacy applications",
        "department": "Inpatient Pharmacy",
        "criticality": "Critical",
        "business_function": "Automated controlled substance dispensing, barcoding, inventory controls",
        "location": "Central Pharmacy & Satellite Stations",
        "owner": "Sarah Lin, PharmD (Clinical Pharmacy Director)",
        "last_updated": "2026-09-04T16:00:00Z"
    },
    {
        "asset_id": "AST-RAD-001",
        "asset_name": "Sectra Enterprise PACS Imaging Archiving Server",
        "asset_type": "Radiology applications",
        "department": "Radiology & Diagnostics",
        "criticality": "High",
        "business_function": "DICOM image store-and-forward, radiologist review workstations",
        "location": "Primary Data Center, Rack 09C",
        "owner": "Marcus Vance (Director of Medical Imaging)",
        "last_updated": "2026-09-05T11:20:00Z"
    },
    {
        "asset_id": "AST-LAB-001",
        "asset_name": "Roche Cobas 8000 Modular Laboratory Analyzer",
        "asset_type": "Laboratory systems",
        "department": "Pathology & Core Lab",
        "criticality": "High",
        "business_function": "Automated blood chemistry and high-throughput diagnostic immunoassay",
        "location": "Clinical Labs, Building C, Room 210",
        "owner": "Dr. Henry Wu (Laboratory Medical Director)",
        "last_updated": "2026-09-01T08:00:00Z" # slightly older, testing freshness
    },
    {
        "asset_id": "AST-LAB-002",
        "asset_name": "Sysmex XN-9100 Hematology Automation Line",
        "asset_type": "Laboratory systems",
        "department": "Hematology Lab",
        "criticality": "Medium",
        "business_function": "Complete blood count and digital blood cell morphology analysis",
        "location": "Clinical Labs, Building C, Room 214",
        "owner": "Dr. Henry Wu (Laboratory Medical Director)",
        "last_updated": "2026-08-15T12:00:00Z" # Stale asset update (>20 days ago)
    },
    {
        "asset_id": "AST-INF-002",
        "asset_name": "Alaris 8015 Point-of-Care Medication Module",
        "asset_type": "Infusion pumps",
        "department": "Pediatric Intensive Care Unit",
        "criticality": "Critical",
        "business_function": "Neonatal micro-infusion and continuous titration monitoring",
        "location": "Tower C, Floor 5, PICU Suite 502",
        "owner": "Sarah Lin, PharmD (Clinical Pharmacy Director)",
        "last_updated": "2026-09-05T22:10:00Z"
    },
    {
        "asset_id": "AST-ADM-001",
        "asset_name": "Staff Scheduling & Bed Management Portal",
        "asset_type": "Electronic Health Record applications",
        "department": "Hospital Administration",
        "criticality": "Medium",
        "business_function": "Nurse roster scheduling, patient transport tracking, bed turn status",
        "location": "Virtual Cloud Instance, AWS us-east-1",
        "owner": "David Kim (Director of Clinical Operations)",
        "last_updated": "2026-09-05T07:45:00Z"
    },
    {
        "asset_id": "AST-FAC-001",
        "asset_name": "Johnson Controls Metasys HVAC & Cleanroom Air Controller",
        "asset_type": "Patient monitoring devices",
        "department": "Facilities & Engineering",
        "criticality": "Low",
        "business_function": "Operating room positive air pressure regulation and surgical suite cooling",
        "location": "Central Utility Plant, Mezzanine",
        "owner": "Thomas Gray (Head of Physical Plant)",
        "last_updated": "2026-08-01T10:00:00Z" # Stale data
    }
]

# 2. CONTROLS
CONTROLS = [
    {
        "control_id": "CTL-SEG-001",
        "control_name": "Medical Device VLAN Network Segmentation",
        "control_type": "Network Segmentation",
        "asset_id": "AST-ICU-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-08-10",
        "effectiveness_score": 92.5,
        "last_verified": "2026-09-05"
    },
    {
        "control_id": "CTL-SEG-002",
        "control_name": "Infusion Pump Isolation Microsegmentation",
        "control_type": "Network Segmentation",
        "asset_id": "AST-INF-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-08-15",
        "effectiveness_score": 88.0,
        "last_verified": "2026-09-04"
    },
    {
        "control_id": "CTL-MFA-001",
        "control_name": "Clinical Portal FIDO2 Multi-Factor Authentication",
        "control_type": "Multi-Factor Authentication",
        "asset_id": "AST-EHR-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-08-01",
        "effectiveness_score": 96.0,
        "last_verified": "2026-09-06"
    },
    {
        "control_id": "CTL-EDR-001",
        "control_name": "CrowdStrike Falcon Medical Endpoint Monitoring",
        "control_type": "Endpoint Monitoring",
        "asset_id": "AST-EHR-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-07-20",
        "effectiveness_score": 94.0,
        "last_verified": "2026-09-05"
    },
    {
        "control_id": "CTL-VSC-001",
        "control_name": "Tenable.sc Passive IoMT Vulnerability Scanning",
        "control_type": "Vulnerability Scanning",
        "asset_id": "AST-MRI-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-08-25",
        "effectiveness_score": 84.0,
        "last_verified": "2026-09-02"
    },
    {
        "control_id": "CTL-ACC-001",
        "control_name": "Role-Based Least Privilege Access Control (RBAC)",
        "control_type": "Access Control",
        "asset_id": "AST-PHR-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-08-05",
        "effectiveness_score": 91.0,
        "last_verified": "2026-09-05"
    },
    {
        "control_id": "CTL-PTC-001",
        "control_name": "Vendor-Validated Medical Firmware Patch Management",
        "control_type": "Patch Management",
        "asset_id": "AST-CTS-001",
        "implementation_status": "Partially Implemented",
        "implementation_date": "2026-08-28",
        "effectiveness_score": 62.0,
        "last_verified": "2026-09-01"
    },
    {
        "control_id": "CTL-IDS-001",
        "control_name": "Suricata DICOM/HL7 Deep Packet Intrusion Detection",
        "control_type": "Intrusion Detection",
        "asset_id": "AST-RAD-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-08-12",
        "effectiveness_score": 89.5,
        "last_verified": "2026-09-05"
    },
    {
        "control_id": "CTL-BAK-001",
        "control_name": "Immutable Air-Gapped PACS Backup and Recovery",
        "control_type": "Backup and Recovery",
        "asset_id": "AST-RAD-001",
        "implementation_status": "Implemented",
        "implementation_date": "2026-07-15",
        "effectiveness_score": 95.0,
        "last_verified": "2026-09-03"
    },
    {
        "control_id": "CTL-MON-001",
        "control_name": "24/7 Clinical SOC SIEM Log Telemetry Monitoring",
        "control_type": "Security Monitoring",
        "asset_id": "AST-ICU-002",
        "implementation_status": "Implemented",
        "implementation_date": "2026-08-18",
        "effectiveness_score": 87.0,
        "last_verified": "2026-09-05"
    },
    {
        "control_id": "CTL-PTC-002",
        "control_name": "Legacy Analyzer Embedded Windows Patching",
        "control_type": "Patch Management",
        "asset_id": "AST-LAB-001",
        "implementation_status": "Failed",
        "implementation_date": "2026-08-01",
        "effectiveness_score": 38.0,
        "last_verified": "2026-08-20" # Stale control verification (>15 days)
    },
    {
        "control_id": "CTL-SEG-003",
        "control_name": "PICU Bedside Pump Wireless Network Isolation",
        "control_type": "Network Segmentation",
        "asset_id": "AST-INF-002",
        "implementation_status": "Planned",
        "implementation_date": "", # Intentional missing date
        "effectiveness_score": 0.0,
        "last_verified": ""
    }
]

# 3. VULNERABILITIES
VULNERABILITIES = [
    {
        "vulnerability_id": "VUL-2026-0891",
        "asset_id": "AST-ICU-001",
        "severity": "Critical",
        "cvss_score": 9.8,
        "status": "Remediated",
        "detected_date": "2026-08-02",
        "remediation_due_date": "2026-08-09",
        "remediation_status": "Completed",
        "remediation_completed_date": "2026-08-08"
    },
    {
        "vulnerability_id": "VUL-2026-1104",
        "asset_id": "AST-INF-001",
        "severity": "High",
        "cvss_score": 8.1,
        "status": "Remediated",
        "detected_date": "2026-08-06",
        "remediation_due_date": "2026-08-20",
        "remediation_status": "Completed",
        "remediation_completed_date": "2026-08-14"
    },
    {
        "vulnerability_id": "VUL-2026-2241",
        "asset_id": "AST-CTS-001",
        "severity": "Critical",
        "cvss_score": 9.1,
        "status": "In Progress",
        "detected_date": "2026-08-26",
        "remediation_due_date": "2026-09-02", # Overdue!
        "remediation_status": "Overdue",
        "remediation_completed_date": ""
    },
    {
        "vulnerability_id": "VUL-2026-3390",
        "asset_id": "AST-LAB-001",
        "severity": "High",
        "cvss_score": 7.8,
        "status": "Open",
        "detected_date": "2026-08-18",
        "remediation_due_date": "2026-09-01", # Overdue!
        "remediation_status": "Overdue",
        "remediation_completed_date": ""
    },
    {
        "vulnerability_id": "VUL-2026-4402",
        "asset_id": "AST-EHR-001",
        "severity": "Medium",
        "cvss_score": 5.4,
        "status": "Remediated",
        "detected_date": "2026-08-12",
        "remediation_due_date": "2026-09-12",
        "remediation_status": "Completed",
        "remediation_completed_date": "2026-08-29"
    },
    {
        "vulnerability_id": "VUL-2026-5511",
        "asset_id": "AST-MRI-001",
        "severity": "Medium",
        "cvss_score": 6.2,
        "status": "In Progress",
        "detected_date": "2026-08-28",
        "remediation_due_date": "2026-09-15",
        "remediation_status": "Under Evaluation",
        "remediation_completed_date": ""
    },
    {
        "vulnerability_id": "VUL-2026-6623",
        "asset_id": "AST-INF-002",
        "severity": "Critical",
        "cvss_score": 9.6,
        "status": "Open",
        "detected_date": "2026-09-03",
        "remediation_due_date": "2026-09-10",
        "remediation_status": "Pending Vendor Advisory",
        "remediation_completed_date": ""
    },
    {
        "vulnerability_id": "VUL-2026-7734",
        "asset_id": "AST-RAD-001",
        "severity": "Low",
        "cvss_score": 3.7,
        "status": "Open",
        "detected_date": "2026-08-22",
        "remediation_due_date": "2026-10-22",
        "remediation_status": "Scheduled Next Cycle",
        "remediation_completed_date": ""
    },
    {
        "vulnerability_id": "VUL-2026-8845",
        "asset_id": "AST-PHR-001",
        "severity": "High",
        "cvss_score": 7.5,
        "status": "Remediated",
        "detected_date": "2026-08-01",
        "remediation_due_date": "2026-08-15",
        "remediation_status": "Completed",
        "remediation_completed_date": "2026-08-12"
    },
    {
        "vulnerability_id": "VUL-2026-9956",
        "asset_id": "AST-ADM-001",
        "severity": "Low",
        "cvss_score": 2.9,
        "status": "Mitigated",
        "detected_date": "2026-08-10",
        "remediation_due_date": "2026-09-10",
        "remediation_status": "Compensating Control Applied",
        "remediation_completed_date": "2026-08-25"
    }
]

# 4. INCIDENTS
INCIDENTS = [
    {
        "incident_id": "INC-2026-0101",
        "asset_id": "AST-ICU-001",
        "incident_type": "Network intrusion",
        "severity": "High",
        "detected_time": "2026-08-04T03:14:00Z",
        "resolved_time": "2026-08-04T05:22:00Z",
        "status": "Resolved",
        "control_id": "CTL-SEG-001",
        "impact_level": "Contained by VLAN microsegmentation; zero patient telemetry interruption"
    },
    {
        "incident_id": "INC-2026-0102",
        "asset_id": "AST-INF-001",
        "incident_type": "Device anomaly",
        "severity": "Critical",
        "detected_time": "2026-08-09T14:45:00Z",
        "resolved_time": "2026-08-09T16:10:00Z",
        "status": "Resolved",
        "control_id": "CTL-SEG-002",
        "impact_level": "Unauthenticated multicast storm quarantined by segment switch; pump delivery safe"
    },
    {
        "incident_id": "INC-2026-0103",
        "asset_id": "AST-EHR-001",
        "incident_type": "Suspicious login",
        "severity": "Medium",
        "detected_time": "2026-08-22T21:05:00Z",
        "resolved_time": "2026-08-22T21:18:00Z",
        "status": "Resolved",
        "control_id": "CTL-MFA-001",
        "impact_level": "Off-hours credential stuffing blocked by MFA challenge push rejection"
    },
    {
        "incident_id": "INC-2026-0104",
        "asset_id": "AST-CTS-001",
        "incident_type": "Vulnerability exploitation",
        "severity": "Critical",
        "detected_time": "2026-09-04T08:30:00Z",
        "resolved_time": "", # Still Active!
        "status": "Investigating",
        "control_id": "CTL-PTC-001",
        "impact_level": "Potential remote shell probing on unpatched legacy CT interface; workstation offline"
    },
    {
        "incident_id": "INC-2026-0105",
        "asset_id": "AST-EHR-001",
        "incident_type": "Malware detection",
        "severity": "High",
        "detected_time": "2026-09-02T11:15:00Z",
        "resolved_time": "2026-09-02T12:05:00Z",
        "status": "Resolved",
        "control_id": "CTL-EDR-001",
        "impact_level": "Ransomware loader quarantined in temp directory before encryption payload triggered"
    },
    {
        "incident_id": "INC-2026-0106",
        "asset_id": "AST-PHR-001",
        "incident_type": "Unauthorized access",
        "severity": "Medium",
        "detected_time": "2026-09-03T19:20:00Z",
        "resolved_time": "2026-09-03T20:05:00Z",
        "status": "Resolved",
        "control_id": "CTL-ACC-001",
        "impact_level": "Nurse account privilege escalation attempt denied by AD security group filter"
    },
    {
        "incident_id": "INC-2026-0107",
        "asset_id": "AST-LAB-001",
        "incident_type": "Device anomaly",
        "severity": "High",
        "detected_time": "2026-09-05T02:10:00Z",
        "resolved_time": "", # Active
        "status": "Active",
        "control_id": "CTL-PTC-002",
        "impact_level": "Excessive outbound SMB connection requests from Cobas analyzer interface PC"
    }
]

# 5. CONTROL TELEMETRY (with intentional quality anomalies: duplicate, delayed, out-of-order)
TELEMETRY = [
    {
        "event_id": "EVT-9001",
        "control_id": "CTL-SEG-001",
        "asset_id": "AST-ICU-001",
        "event_timestamp": "2026-09-05T12:00:00Z",
        "event_type": "monitoring_heartbeat",
        "control_status": "control_success",
        "source": "Cisco Catalyst 9300 NetFlow",
        "processing_timestamp": "2026-09-05T12:00:03Z"
    },
    {
        "event_id": "EVT-9002",
        "control_id": "CTL-SEG-001",
        "asset_id": "AST-ICU-001",
        "event_timestamp": "2026-09-05T13:00:00Z",
        "event_type": "alert_generated",
        "control_status": "control_success",
        "source": "Cisco Catalyst 9300 NetFlow",
        "processing_timestamp": "2026-09-05T13:00:05Z"
    },
    # DUPLICATE EVENT (Intentional anomaly for testing)
    {
        "event_id": "EVT-9002",
        "control_id": "CTL-SEG-001",
        "asset_id": "AST-ICU-001",
        "event_timestamp": "2026-09-05T13:00:00Z",
        "event_type": "alert_generated",
        "control_status": "control_success",
        "source": "Cisco Catalyst 9300 NetFlow (Duplicate Relay)",
        "processing_timestamp": "2026-09-05T13:02:10Z"
    },
    # DELAYED EVENT (Gap of 36 hours between event and processing)
    {
        "event_id": "EVT-9003",
        "control_id": "CTL-PTC-001",
        "asset_id": "AST-CTS-001",
        "event_timestamp": "2026-09-03T04:10:00Z",
        "event_type": "control_failure",
        "control_status": "control_failure",
        "source": "GE Apex Local Syslog Buffer",
        "processing_timestamp": "2026-09-04T16:40:00Z" # DELAYED by >36h!
    },
    # OUT-OF-ORDER EVENT (Older timestamp arriving after newer)
    {
        "event_id": "EVT-9004",
        "control_id": "CTL-EDR-001",
        "asset_id": "AST-EHR-001",
        "event_timestamp": "2026-09-05T18:30:00Z",
        "event_type": "control_success",
        "control_status": "control_success",
        "source": "CrowdStrike Falcon Event Stream",
        "processing_timestamp": "2026-09-05T18:30:02Z"
    },
    {
        "event_id": "EVT-9005",
        "control_id": "CTL-EDR-001",
        "asset_id": "AST-EHR-001",
        "event_timestamp": "2026-09-05T16:15:00Z", # OUT OF ORDER: earlier than EVT-9004!
        "event_type": "alert_generated",
        "control_status": "control_success",
        "source": "CrowdStrike Falcon Sensor Offline Queue",
        "processing_timestamp": "2026-09-05T18:31:00Z"
    },
    {
        "event_id": "EVT-9006",
        "control_id": "CTL-MFA-001",
        "asset_id": "AST-EHR-001",
        "event_timestamp": "2026-09-05T20:10:00Z",
        "event_type": "control_success",
        "control_status": "control_success",
        "source": "Azure AD / Entra ID Sign-in Audit",
        "processing_timestamp": "2026-09-05T20:10:04Z"
    },
    {
        "event_id": "EVT-9007",
        "control_id": "CTL-VSC-001",
        "asset_id": "AST-MRI-001",
        "event_timestamp": "2026-09-02T11:00:00Z", # STALE TELEMETRY (4 days ago)
        "event_type": "vulnerability_detected",
        "control_status": "control_success",
        "source": "Tenable.sc IoMT Engine",
        "processing_timestamp": "2026-09-02T11:05:00Z"
    },
    {
        "event_id": "EVT-9008",
        "control_id": "CTL-PTC-002",
        "asset_id": "AST-LAB-001",
        "event_timestamp": "2026-09-05T02:15:00Z",
        "event_type": "control_failure",
        "control_status": "control_failure",
        "source": "WSUS Automated Update Agent",
        "processing_timestamp": "2026-09-05T02:15:20Z"
    },
    {
        "event_id": "EVT-9009",
        "control_id": "CTL-IDS-001",
        "asset_id": "AST-RAD-001",
        "event_timestamp": "2026-09-05T21:40:00Z",
        "event_type": "monitoring_heartbeat",
        "control_status": "control_success",
        "source": "Suricata IDS Sensor Rack-09",
        "processing_timestamp": "2026-09-05T21:40:01Z"
    },
    {
        "event_id": "EVT-9010",
        "control_id": "CTL-SEG-002",
        "asset_id": "AST-INF-001",
        "event_timestamp": "2026-09-05T22:00:00Z",
        "event_type": "control_success",
        "control_status": "control_success",
        "source": "Aruba ClearPass Policy Manager",
        "processing_timestamp": "2026-09-05T22:00:05Z"
    },
    {
        "event_id": "EVT-9011",
        "control_id": "CTL-BAK-001",
        "asset_id": "AST-RAD-001",
        "event_timestamp": "2026-09-03T02:00:00Z",
        "event_type": "control_success",
        "control_status": "control_success",
        "source": "Rubrik Immutable Vault Verification",
        "processing_timestamp": "2026-09-03T02:15:00Z"
    },
    {
        "event_id": "EVT-9012",
        "control_id": "CTL-MON-001",
        "asset_id": "AST-ICU-002",
        "event_timestamp": "2026-09-05T23:50:00Z",
        "event_type": "monitoring_heartbeat",
        "control_status": "control_success",
        "source": "Splunk Clinical Heavy Forwarder",
        "processing_timestamp": "2026-09-05T23:50:02Z"
    },
    # REPEAT FAILURE EVENT TO TEST ELEVATED FAILURE RATE
    {
        "event_id": "EVT-9013",
        "control_id": "CTL-PTC-002",
        "asset_id": "AST-LAB-001",
        "event_timestamp": "2026-09-05T03:30:00Z",
        "event_type": "control_failure",
        "control_status": "control_failure",
        "source": "WSUS Automated Update Agent",
        "processing_timestamp": "2026-09-05T03:30:15Z"
    }
]

# 6. REMEDIATION (Includes intentional missing items, verified vs unverified)
REMEDIATIONS = [
    {
        "remediation_id": "REM-2026-001",
        "vulnerability_id": "VUL-2026-0891",
        "asset_id": "AST-ICU-001",
        "action": "Applied Mindray OEM emergency kernel patch and hardened TLS cipher suite",
        "status": "Completed",
        "assigned_team": "Clinical Engineering & SOC Tier 3",
        "started_date": "2026-08-04",
        "completed_date": "2026-08-08",
        "verification_status": "Verified Effective"
    },
    {
        "remediation_id": "REM-2026-002",
        "vulnerability_id": "VUL-2026-1104",
        "asset_id": "AST-INF-001",
        "action": "Disabled unencrypted telnet and upgraded Baxter Gateway firmware to v4.2.1",
        "status": "Completed",
        "assigned_team": "Biomedical Engineering",
        "started_date": "2026-08-10",
        "completed_date": "2026-08-14",
        "verification_status": "Verified Effective"
    },
    {
        "remediation_id": "REM-2026-003",
        "vulnerability_id": "VUL-2026-2241",
        "asset_id": "AST-CTS-001",
        "action": "Awaiting GE OEM technician site visit for FDA-certified scanner update",
        "status": "In Progress",
        "assigned_team": "Medical Imaging Tech Ops",
        "started_date": "2026-08-28",
        "completed_date": "", # Still in progress
        "verification_status": "Pending"
    },
    {
        "remediation_id": "REM-2026-004",
        "vulnerability_id": "VUL-2026-3390",
        "asset_id": "AST-LAB-001",
        "action": "Cobas analyzer Windows 7 embedded OS patch failed compatibility testing",
        "status": "Blocked",
        "assigned_team": "Lab Informatics & Vendor Support",
        "started_date": "2026-08-20",
        "completed_date": "",
        "verification_status": "Failed"
    },
    {
        "remediation_id": "REM-2026-005",
        "vulnerability_id": "VUL-2026-4402",
        "asset_id": "AST-EHR-001",
        "action": "Patched OpenSSL vulnerability in Web Blob proxy nodes",
        "status": "Completed",
        "assigned_team": "Core IT Infrastructure",
        "started_date": "2026-08-20",
        "completed_date": "2026-08-29",
        "verification_status": "Verified Effective"
    },
    {
        "remediation_id": "REM-2026-006",
        "vulnerability_id": "VUL-2026-8845",
        "asset_id": "AST-PHR-001",
        "action": "Reconfigured Pyxis dispensing server Active Directory sync policy",
        "status": "Completed",
        "assigned_team": "Pharmacy IT",
        "started_date": "2026-08-05",
        "completed_date": "2026-08-12",
        "verification_status": "Verified Effective"
    },
    {
        "remediation_id": "REM-2026-007",
        "vulnerability_id": "VUL-2026-9956",
        "asset_id": "AST-ADM-001",
        "action": "Implemented Web Application Firewall rule filtering malformed HTTP parameters",
        "status": "Completed",
        "assigned_team": "Cyber Operations",
        "started_date": "2026-08-15",
        "completed_date": "2026-08-25",
        "verification_status": "Verified Effective"
    }
    # Notice: VUL-2026-6623 (Critical on AST-INF-002) deliberately has NO remediation entry yet, demonstrating MISSING remediation data!
]

def write_csv(filename, fieldnames, rows):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    print(f"[OK] Generated {filename} ({len(rows)} records) at {filepath}")

def main():
    print("=== Generating Realistic Hospital SOC Datasets for Phase 1 ===")
    
    # 1. assets.csv
    asset_fields = [
        "asset_id", "asset_name", "asset_type", "department", 
        "criticality", "business_function", "location", "owner", "last_updated"
    ]
    write_csv("assets.csv", asset_fields, ASSETS)

    # 2. controls.csv
    control_fields = [
        "control_id", "control_name", "control_type", "asset_id",
        "implementation_status", "implementation_date", "effectiveness_score", "last_verified"
    ]
    write_csv("controls.csv", control_fields, CONTROLS)

    # 3. vulnerabilities.csv
    vuln_fields = [
        "vulnerability_id", "asset_id", "severity", "cvss_score",
        "status", "detected_date", "remediation_due_date", "remediation_status", "remediation_completed_date"
    ]
    write_csv("vulnerabilities.csv", vuln_fields, VULNERABILITIES)

    # 4. incidents.csv
    incident_fields = [
        "incident_id", "asset_id", "incident_type", "severity",
        "detected_time", "resolved_time", "status", "control_id", "impact_level"
    ]
    write_csv("incidents.csv", incident_fields, INCIDENTS)

    # 5. control_telemetry.csv
    telemetry_fields = [
        "event_id", "control_id", "asset_id", "event_timestamp",
        "event_type", "control_status", "source", "processing_timestamp"
    ]
    write_csv("control_telemetry.csv", telemetry_fields, TELEMETRY)

    # 6. remediation.csv
    remediation_fields = [
        "remediation_id", "vulnerability_id", "asset_id", "action",
        "status", "assigned_team", "started_date", "completed_date", "verification_status"
    ]
    write_csv("remediation.csv", remediation_fields, REMEDIATIONS)

    print("=== Dataset Generation Complete ===")

if __name__ == "__main__":
    main()
