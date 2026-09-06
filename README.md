# 🏥 Hospital SOC Control Effectiveness & Business Risk Dashboard

> **Enterprise Clinical Cyber-Risk Intelligence & SOC Telemetry Translation Platform**  
> Translating technical IoMT security telemetry, vulnerabilities, and control metrics into quantified clinical business-risk reduction and patient safety assurance.

---

## 📋 கண்ணோட்டம் (Overview)

இந்த **Hospital SOC Control Effectiveness & Business Risk Dashboard** என்பது மருத்துவமனை பாதுகாப்பு செயல்பாட்டு மையம் (Security Operations Center - SOC) மற்றும் மருத்துவப் பொறியியல் துறைகளுக்காக உருவாக்கப்பட்ட விரிவான மேலாண்மை தளமாகும். இது தொழில்நுட்ப ரீதியான சைபர் பாதுகாப்பு நிகழ்வுகள், IoMT (Internet of Medical Things) மருத்துவ உபகரணங்களின் அச்சுறுத்தல்கள் மற்றும் கட்டுப்பாட்டு அளவீடுகளை (Control Metrics) வணிக மற்றும் நோயாளி பாதுகாப்பு அபாயக் குறைப்பாக (Clinical Business Risk Reduction) கணக்கிட்டு வழங்குகிறது.

---

## 🌟 Key Features & Capabilities

### 1. Role-Adaptive Executive Workspaces
Switch seamlessly between three distinct operational viewpoints:
* **Hospital Management / CISO / Board**:
  * Executive clinical risk reduction overview (Enterprise baseline risk vs. current risk).
  * Protected critical life-support assets count (Infusion pumps, CT Scanners, ICU Monitors).
  * Regulatory and framework compliance posture (HIPAA, NIST CSF 2.0, IEC 62304, ISO 27799).
  * Strategic executive guidance and capital expenditure recommendations.
* **SOC Analyst / Incident Responder**:
  * Real-time triage queue for ongoing security incidents with patient-safety impact indicators.
  * Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR) tracking.
  * Ingested telemetry pipeline health and live anomaly counters.
  * CVE vulnerability explorer with CVSS v3.1 scoring, exploit availability, and biomedical patch status.
* **Security & Biomedical Engineering Manager**:
  * Fleet-wide control coverage and live effectiveness scoring (Effective, Partially Effective, Ineffective).
  * Domain-level efficacy scorecards (Network Segmentation, Endpoint EDR, Access & MFA, Patch Management).
  * Remediation SLA adherence tracking and cryptographic audit evidence readiness.

### 2. Deep Medical Asset & IoMT Management
* Comprehensive inventory tracking of high-risk biomedical systems:
  * Infusion Pump Gateways, Point-of-Care Modules (Alaris, Baxter).
  * Diagnostic Imaging (Siemens MRI, GE Revolution CT Scanner, Sectra PACS).
  * Core Patient Monitoring & EHR (Mindray BeneVision, Philips IntelliVue, Epic Hyperspace).
  * Critical Facilities (Johnson Controls HVAC / Cleanroom Controllers).
* Asset risk profiles calculated via mathematical compounding of intrinsic vulnerability severity, operational exposure, and control mitigation factors.

### 3. End-to-End Cryptographic Evidence & Lineage
* Full chain of custody connecting raw telemetry log records to high-level clinical risk numbers.
* Audit-ready evidence modals detailing SHA-256 verification hashes, verification status, and timestamp lineage.

### 4. Interactive Simulation & Failure Testing
* Built-in anomaly injection lab to evaluate SOC resilience:
  * **Ransomware / Lateral Movement Simulation**
  * **IoMT Telemetry Silence / Sensor Drop**
  * **Brute-force / Credential Stuffing on Medical Portal**
  * **Out-of-band Firmware Tampering**
* Real-time re-calculation of risk scores and telemetry confidence indicators.

### 5. Automated Data Pipeline & Freshness Validation
* Continuous health inspection of ingested CSV telemetry streams (`/data/*.csv`).
* Automated staleness detection with confidence grading (`HIGH`, `MEDIUM`, `LOW`) based on real-time log ingestion thresholds.

---

## 🏗 Architecture & Tech Stack

```
├── client/ (Single Page App)
│   ├── React 19 + TypeScript
│   ├── Tailwind CSS v4 + Motion Animations
│   ├── Recharts (Dynamic clinical & risk visualization)
│   └── Lucide React (Accessible iconography)
│
├── server/ (Full-Stack Backend)
│   ├── Express 4.21 (REST API endpoints)
│   ├── server/dataService.ts (Dynamic calculation engine & CSV parser)
│   ├── Vite middleware (Dev mode) / esbuild CJS bundle (Production mode)
│   └── Port: 3000 (0.0.0.0 binding)
│
└── data/ (Normalized Data Ingest Pipelines)
    ├── assets.csv (Biomedical & IT asset inventory)
    ├── controls.csv (Security safeguards & configuration)
    ├── control_telemetry.csv (Real-time telemetry event streams)
    ├── incidents.csv (SOC incident records & clinical severity)
    ├── remediation.csv (Biomedical engineering patch track)
    └── vulnerabilities.csv (Known CVEs & remediation status)
```

---

## 🚀 Quick Start & Installation

### Pre-requisites
* **Node.js**: v20.x or higher
* **npm**: v10.x or higher

### 1. Repository Setup
```bash
# Clone the repository
git clone <repository-url>
cd hospital-soc-dashboard

# Install dependencies
npm install
```

### 2. Running in Development Mode
To start the full-stack application (Express API server + Vite client middleware):
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Production Build & Execution
To compile the frontend static assets and bundle the server:
```bash
# Compile client and server
npm run build

# Launch the production service
npm start
```

### 4. Code Quality & Verification
To run TypeScript strict static analysis:
```bash
npm run lint
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check and service status probe |
| `/api/overview` | `GET` | Master dashboard state, role-tailored KPIs, and risk summaries |
| `/api/risks` | `GET` | Enterprise baseline vs. current clinical risk breakdown |
| `/api/controls` | `GET` | List of all controls with calculated effectiveness ratings |
| `/api/assets` | `GET` | Medical and clinical asset inventory with risk profiles |
| `/api/vulnerabilities` | `GET` | Active CVE tracking, CVSS scores, and remediation milestones |
| `/api/incidents` | `GET` | Security incidents with clinical impact categorization |
| `/api/remediation` | `GET` | Patch progress, engineering actions, and validation status |
| `/api/telemetry` | `GET` | Ingested telemetry events, anomaly alerts, and pipeline rates |
| `/api/freshness` | `GET` | Pipeline staleness report and dataset confidence ratings |
| `/api/evidence/:id` | `GET` | Full audit trail and evidence drilldown for any asset or control |
| `/api/simulate-event` | `POST` | Injects simulated threat or telemetry failure events |
| `/api/reset-simulation`| `POST` | Resets active simulations back to clean baseline state |

---

## 🔒 Security & Medical Regulatory Compliance

* **HIPAA Security Rule Compliance**: Audit controls (§164.312(b)), transmission security (§164.312(e)), and emergency access validation.
* **NIST Cybersecurity Framework 2.0**: Mapped to Identify (ID), Protect (PR), Detect (DE), Respond (RS), and Recover (RC).
* **IEC 62304 / ISO 27799**: Health informatics information security governance for healthcare organizations.
* **Zero Client-Exposed Secrets**: All sensitive calculations and data pipelines are safely processed server-side.

---

## 📄 License & Attribution

Developed for Healthcare Cyber-Physical Systems and Security Operations Centers. Internal hospital use and authorized security research.
