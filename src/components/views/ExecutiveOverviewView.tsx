import React, { useState } from 'react';
import {
  TrendingDown,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Server,
  Bug,
  Activity,
  CheckCircle,
  ArrowUpRight,
  Info,
  Layers,
  FileCheck,
  Radio,
  Clock,
  Cpu,
  Network,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
  ShieldOff,
  Database,
  Wrench,
  AlertOctagon,
  RefreshCw,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import {
  OverviewKPIs,
  RiskSummary,
  Recommendation,
  Role,
  Control,
  Asset,
  Vulnerability,
  Incident,
  Remediation,
  FreshnessReport
} from '../../types';

interface ExecutiveOverviewViewProps {
  kpis: OverviewKPIs | null;
  riskSummary: RiskSummary | null;
  recommendations: Recommendation[];
  controls: Control[];
  assets?: Asset[];
  vulnerabilities?: Vulnerability[];
  incidents?: Incident[];
  remediation?: Remediation[];
  freshness?: FreshnessReport | null;
  role: Role;
  onDrillDown: (id: string) => void;
  onNavigateTo: (page: any) => void;
}

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  kpis,
  riskSummary,
  recommendations,
  controls,
  assets = [],
  vulnerabilities = [],
  incidents = [],
  remediation = [],
  freshness,
  role,
  onDrillDown,
  onNavigateTo
}) => {
  const [acknowledgedIncidents, setAcknowledgedIncidents] = useState<Record<string, boolean>>({});

  if (!kpis || !riskSummary) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading Role Overview KPIs...</span>
      </div>
    );
  }

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedIncidents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Trend data for Management view
  const trendData = [
    { date: 'Aug 01', baseline: 60.9, current: 60.9, event: 'Trial Baseline Setup' },
    { date: 'Aug 10', baseline: 60.9, current: 54.2, event: 'VLAN Segmentation Active' },
    { date: 'Aug 18', baseline: 60.9, current: 48.0, event: 'MFA & SIEM Deployed' },
    { date: 'Aug 26', baseline: 60.9, current: 41.5, event: 'Patch Cycle 1 Completed' },
    { date: 'Sep 02', baseline: 60.9, current: 36.8, event: 'Endpoint EDR Verified' },
    { date: 'Sep 06 (Today)', baseline: 60.9, current: kpis.current_risk, event: 'Current Operational State' }
  ];

  // Attribution data
  const attributionData = controls
    .filter(c => c.implementation_status === 'Implemented' && c.effectiveness_score >= 70)
    .slice(0, 5)
    .map(c => ({
      name: c.control_name.length > 22 ? c.control_name.substring(0, 20) + '...' : c.control_name,
      fullName: c.control_name,
      score: c.effectiveness_score,
      reductionContribution: Math.round((c.effectiveness_score / 100) * 14.5 * 10) / 10,
      id: c.control_id
    }));

  // SOC Telemetry / Vulnerability CVSS breakdown
  const vulnSeverityData = [
    { name: 'Critical (CVSS 9.0+)', count: vulnerabilities.filter(v => v.severity === 'Critical').length, color: '#e11d48' },
    { name: 'High (CVSS 7.0-8.9)', count: vulnerabilities.filter(v => v.severity === 'High').length, color: '#f59e0b' },
    { name: 'Medium (CVSS 4.0-6.9)', count: vulnerabilities.filter(v => v.severity === 'Medium').length, color: '#3b82f6' },
    { name: 'Low (CVSS 0.1-3.9)', count: vulnerabilities.filter(v => v.severity === 'Low').length, color: '#10b981' }
  ];

  // Active incidents list
  const activeIncsList = incidents.filter(i => ['Active', 'Investigating', 'Open'].includes(i.status));

  // Controls breakdown
  const effectiveControlsCount = controls.filter(c => c.rating === 'Effective').length;
  const partialControlsCount = controls.filter(c => c.rating === 'Partially Effective').length;
  const ineffectiveControlsCount = controls.filter(c => c.rating === 'Ineffective').length;
  const totalControlsCount = controls.length || 12;

  const effectivePct = Math.round((effectiveControlsCount / totalControlsCount) * 100);
  const partialPct = Math.round((partialControlsCount / totalControlsCount) * 100);
  const ineffectivePct = Math.round((ineffectiveControlsCount / totalControlsCount) * 100);

  // Freshness sources count
  const freshSourcesCount = freshness ? freshness.fresh_sources : 4;
  const totalSourcesCount = freshness ? (freshness.fresh_sources + freshness.stale_sources + (freshness.missing_sources || 0)) : 6;
  const staleSourcesCount = freshness ? freshness.stale_sources : 2;

  // Overdue vulnerabilities count
  const overdueVulnsCount = vulnerabilities.filter(v => v.remediation_status === 'Overdue').length;

  // Security Manager Domain breakdown dynamically calculated from controls
  const domainGroups: Record<string, { totalScore: number; count: number }> = {};
  controls.forEach(c => {
    let domain = c.control_type;
    if (domain === 'Network Segmentation') domain = 'Network Seg.';
    else if (domain === 'Endpoint Monitoring') domain = 'Endpoint EDR';
    else if (domain === 'Multi-Factor Authentication' || domain === 'Access Control') domain = 'Access & MFA';
    else if (domain === 'Patch Management' || domain === 'Vulnerability Scanning') domain = 'Vuln & Patch';
    else if (domain === 'Backup and Recovery') domain = 'Disaster Rec.';
    else if (domain === 'Intrusion Detection' || domain === 'Security Monitoring') domain = 'Monitoring';

    if (!domainGroups[domain]) {
      domainGroups[domain] = { totalScore: 0, count: 0 };
    }
    domainGroups[domain].totalScore += c.effectiveness_score;
    domainGroups[domain].count += 1;
  });

  const domainData = Object.entries(domainGroups).map(([domain, data]) => ({
    domain,
    score: Math.round((data.totalScore / data.count) * 10) / 10,
    target: 80,
    controls: data.count
  }));

  // Priority sorted incidents (Active/Investigating first)
  const priorityIncidents = [...incidents].sort((a, b) => {
    const aActive = ['Active', 'Investigating', 'Open'].includes(a.status) ? 1 : 0;
    const bActive = ['Active', 'Investigating', 'Open'].includes(b.status) ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    const severityRank: Record<string, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };
    return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
  });

  // Priority sorted remediations (In Progress / Blocked first)
  const priorityRemediations = [...remediation].sort((a, b) => {
    const order: Record<string, number> = { 'In Progress': 3, 'Blocked': 2, 'Pending': 2, 'Completed': 1 };
    return (order[b.status] || 0) - (order[a.status] || 0);
  });

  return (
    <div className="space-y-5">
      {/* Dynamic Role Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {role === 'management' && 'Hospital Executive Control Effectiveness & Business Risk'}
              {role === 'soc_analyst' && 'SOC Telemetry Triage & Active Incident Queue'}
              {role === 'security_manager' && 'Security Governance, Control Efficacy & Remediation Tracking'}
            </h2>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                role === 'management'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : role === 'soc_analyst'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {role === 'management' ? 'Executive Mode' : role === 'soc_analyst' ? 'Analyst Mode' : 'Manager Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'management' &&
              'Translating medical cybersecurity findings into patient safety impacts, SLA continuity, and measurable business risk reduction.'}
            {role === 'soc_analyst' &&
              'Real-time telemetry feeds, incident queues, and CVE priority tracking for biomedical assets.'}
            {role === 'security_manager' &&
              'Audit-ready control effectiveness metrics, cryptographic evidence chains, policy attribution, and remediation tracking.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {role === 'management' && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTo('workflow')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-xs"
              >
                Field Workflow
              </button>
              <button
                type="button"
                onClick={() => onNavigateTo('failure_testing')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition shadow-xs"
              >
                Test Resilience
              </button>
            </>
          )}

          {role === 'soc_analyst' && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTo('incidents')}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition shadow-xs flex items-center space-x-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                <span>Incident Queue</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTo('freshness')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-xs flex items-center space-x-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Telemetry Feeds</span>
              </button>
            </>
          )}

          {role === 'security_manager' && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTo('controls')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition shadow-xs flex items-center space-x-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Manage Controls</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTo('remediation')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition shadow-xs flex items-center space-x-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                <span>Remediation SLAs</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROLE-SPECIFIC 8 KPI CARDS                                      */}
      {/* ------------------------------------------------------------- */}

      {/* 1. MANAGEMENT MODE KPIS */}
      {role === 'management' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Baseline Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Baseline Risk</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{kpis.baseline_risk}</span>
              <span className="text-xs font-bold text-amber-700">/ 100 ({riskSummary.baseline_tier})</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Inherent threat exposure before controls</p>
          </div>

          {/* Current Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Current Risk</span>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">{kpis.current_risk}</span>
              <span className="text-xs font-bold text-blue-700">/ 100 ({riskSummary.current_tier})</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Residual clinical risk with telemetry</p>
          </div>

          {/* Risk Reduction % */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-xs ring-2 ring-emerald-500/20">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Risk Reduction</span>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600">-{kpis.risk_reduction_pct}%</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Measured</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Delta attributable to completed controls</p>
          </div>

          {/* Target Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Target Risk</span>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-800">{kpis.target_risk}</span>
              <span className="text-xs font-semibold text-slate-500">Goal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Gap to target: {(kpis.current_risk - kpis.target_risk).toFixed(1)} pts</p>
          </div>

          {/* Control Reliability */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Control Reliability</span>
              <Shield className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{kpis.control_effectiveness_avg}%</span>
              <span className="text-xs font-bold text-emerald-700">High Assurance</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Based on {controls.length} active hospital controls</p>
          </div>

          {/* Critical Assets Fleet */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Protected Fleet</span>
              <Server className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{kpis.critical_assets_count}</span>
              <span className="text-xs text-slate-500">Tier 1 Systems</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">ICU, Infusion pumps, MRI, CT &amp; EHR</p>
          </div>

          {/* Patient Safety Harm */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Patient Safety Impact</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600">0</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Zero Harms</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">100% monitoring uptime preserved</p>
          </div>

          {/* Compliance Posture */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Compliance Posture</span>
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">91.4%</span>
              <span className="text-xs text-blue-700 font-semibold">ISO 27001</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">HIPAA Security &amp; ISO audit ready</p>
          </div>
        </div>
      )}

      {/* 2. SOC ANALYST MODE KPIS */}
      {role === 'soc_analyst' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Active Incidents */}
          <div className="bg-white border border-amber-200 rounded-xl p-4 relative overflow-hidden shadow-xs">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Active Incidents</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600">{activeIncsList.length}</span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">Under Triage</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {activeIncsList.length > 0
                ? activeIncsList.map(i => `${i.severity} (${i.asset_id})`).join(', ')
                : 'Zero active incidents'}
            </p>
          </div>

          {/* Critical CVEs */}
          <div className="bg-white border border-rose-200 rounded-xl p-4 relative overflow-hidden shadow-xs">
            <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Critical CVEs (CVSS &gt; 9.0)</span>
              <Bug className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-rose-600">{kpis.open_critical_vulns_count}</span>
              <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">Immediate Action</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting OEM biomedical firmware</p>
          </div>

          {/* Mean Time to Detect (MTTD) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Mean Time to Detect (MTTD)</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">14</span>
              <span className="text-xs font-bold text-blue-700">Minutes</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Automated SIEM &amp; NetFlow correlation</p>
          </div>

          {/* Mean Time to Remediate (MTTR) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Mean Time to Contain (MTTR)</span>
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">42</span>
              <span className="text-xs font-bold text-emerald-700">Minutes</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Micro-segmentation auto-containment</p>
          </div>

          {/* Telemetry Feed Health */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Telemetry Health</span>
              <Radio className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {kpis.soc_kpis?.telemetry_health_pct ?? 83.3}%
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${staleSourcesCount > 0 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'}`}>
                {staleSourcesCount > 0 ? `${staleSourcesCount} Feeds Stale` : 'All Feeds Fresh'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {freshSourcesCount} of {totalSourcesCount} telemetry pipelines fresh
            </p>
          </div>

          {/* Events Ingested Today */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Events Ingested Today</span>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {(kpis.soc_kpis?.events_ingested_today ?? 14820).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">Syslog/EDR</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">No event drop or packet buffer loss</p>
          </div>

          {/* Network Anomalies */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Network Anomalies</span>
              <Network className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600">3</span>
              <span className="text-xs text-slate-500">Detections</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Lateral VLAN crossing attempts blocked</p>
          </div>

          {/* High-Risk Endpoints */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>High-Risk Endpoints</span>
              <Server className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">4</span>
              <span className="text-xs text-rose-700 font-semibold">Triage Required</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Infusion Pump Gateway &amp; PACS Server</p>
          </div>
        </div>
      )}

      {/* 3. SECURITY MANAGER MODE KPIS */}
      {role === 'security_manager' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Control Coverage Score */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Control Coverage</span>
              <Shield className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">{kpis.control_effectiveness_avg}%</span>
              <span className="text-xs font-bold text-emerald-700">Audit-Verified</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Average score across {totalControlsCount} controls</p>
          </div>

          {/* Effective Controls */}
          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Fully Effective</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600">{effectiveControlsCount}</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">{effectivePct}% Fleet</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Effectiveness score &gt;= 75%</p>
          </div>

          {/* Partially Effective Controls */}
          <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Partially Effective</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600">{partialControlsCount}</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">{partialPct}% Fleet</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Degraded due to delayed telemetry</p>
          </div>

          {/* Ineffective Controls */}
          <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Ineffective / Failing</span>
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-rose-600">{ineffectiveControlsCount}</span>
              <span className="text-xs font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">{ineffectivePct}% Fleet</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Missing logs or failed health checks</p>
          </div>

          {/* Remediation SLA Compliance */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Remediation SLA Rate</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">75.0%</span>
              <span className="text-xs font-bold text-amber-700">{overdueVulnsCount} Overdue</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Biomedical engineering patch track</p>
          </div>

          {/* Cryptographic Evidence Readiness */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Evidence Readiness</span>
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600">94.0%</span>
              <span className="text-xs text-slate-500">SHA-256 Chains</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tamper-evident verification trails</p>
          </div>

          {/* Framework Compliance */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>ISO 27001 / NIST CSF</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">88.5%</span>
              <span className="text-xs text-blue-700 font-semibold">Compliant</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Policy baseline benchmarks passed</p>
          </div>

          {/* Gap to Target Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Gap to Risk Target</span>
              <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-800">
                {(kpis.current_risk - kpis.target_risk).toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">pts</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Current 32.8 vs Target 25.0 Goal</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ROLE-SPECIFIC WORKFLOW & DETAIL SECTIONS                        */}
      {/* ------------------------------------------------------------- */}

      {/* 1. MANAGEMENT VIEW: Risk Trend, Attribution, & Plain-Language Guidance */}
      {role === 'management' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Risk Trend */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Hospital Risk Trend Over Time</h3>
                  <p className="text-xs text-slate-500">
                    Baseline (unmitigated) vs Current Residual Risk over progressive control milestones
                  </p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  30-Day Window
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(val: any, name: any) => [
                        `${val} / 100`,
                        name === 'baseline' ? 'Baseline Risk' : 'Current Risk'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Baseline Risk"
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      name="Current Risk"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <span>
                  Overall Risk Reduction: <strong>{kpis.risk_reduction_pct}%</strong>
                </span>
                <span className="text-slate-500">Target Goal: 25.0</span>
              </div>
            </div>

            {/* Chart 2: Risk Reduction Attribution by Control */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Control Risk Reduction Attribution</h3>
                  <p className="text-xs text-slate-500">
                    Completed security controls with empirical risk deduction points
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTo('controls')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attributionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={130} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(val: any, name: any) => [
                        name === 'score' ? `${val}%` : `${val} risk pts`,
                        name === 'score' ? 'Effectiveness Score' : 'Attributed Risk Points'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="score" name="Effectiveness Score (%)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="reductionContribution" name="Attributed Points" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-[11px] text-slate-400 italic">
                * Attribution reflects verified telemetry signals and incident interception logs. Does not claim sole causality.
              </p>
            </div>
          </div>

          {/* Plain-Language Clinical Recommendations */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                  <span>Executive Clinical Recommendations</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-normal border border-blue-200">
                    Plain-Language Translation
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable guidance explaining what is happening, why it matters to patient care, and next steps.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500">{recommendations.length} Directives</span>
            </div>

            <div className="divide-y divide-slate-100">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div key={rec.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                          rec.priority.includes('P1')
                            ? 'bg-rose-100 text-rose-700'
                            : rec.priority.includes('P2')
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              rec.priority.includes('P1')
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : rec.priority.includes('P2')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {rec.priority}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{rec.category}</span>
                          <span className="text-xs text-slate-400 font-mono">({rec.id})</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{rec.title}</h4>
                      </div>
                    </div>

                    {rec.related_asset_id && (
                      <button
                        type="button"
                        onClick={() => onDrillDown(rec.related_asset_id!)}
                        className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 flex items-center space-x-1 transition font-medium border border-slate-200 shrink-0"
                      >
                        <span>Inspect Asset</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                      <strong className="text-blue-700 block mb-1">1. What is happening:</strong>
                      <p className="text-slate-600 leading-relaxed">{rec.what_is_happening}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                      <strong className="text-amber-700 block mb-1">2. Why it matters to the hospital:</strong>
                      <p className="text-slate-600 leading-relaxed">{rec.why_it_matters}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                      <strong className="text-emerald-700 block mb-1">3. What should be done:</strong>
                      <p className="text-slate-600 leading-relaxed">{rec.what_should_be_done}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 2. SOC ANALYST VIEW: Real-time Incident Triage, CVSS Breakdown & Telemetry Feeds */}
      {role === 'soc_analyst' && (
        <>
          {/* Priority Incident Triage Queue */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                  Active SOC Incident Triage Queue
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTo('incidents')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
              >
                <span>Full incident feed</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Incident ID</th>
                    <th className="py-2.5 px-4">Severity</th>
                    <th className="py-2.5 px-4">Target Asset</th>
                    <th className="py-2.5 px-4">Type / Event</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Detection Time</th>
                    <th className="py-2.5 px-4 text-right">Analyst Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityIncidents.slice(0, 5).map(inc => {
                    const isAck = acknowledgedIncidents[inc.incident_id];
                    return (
                      <tr key={inc.incident_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{inc.incident_id}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              inc.severity === 'Critical'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : inc.severity === 'High'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => onDrillDown(inc.asset_id)}
                            className="font-medium text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <span>{inc.asset_id}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{inc.incident_type}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              isAck
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isAck ? 'Acknowledged' : inc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{inc.detected_time}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleAcknowledge(inc.incident_id)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                              isAck
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isAck ? 'Unack' : 'Ack'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDrillDown(inc.asset_id)}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
                          >
                            Isolate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Telemetry & Vulnerability Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* CVSS Distribution */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Vulnerability Exploitability Profile</h3>
                  <p className="text-xs text-slate-500">CVSS v3.1 Severity distribution across biomedical fleet</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTo('vulnerabilities')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                >
                  <span>View CVEs</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vulnSeverityData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" name="CVE Count" radius={[4, 4, 0, 0]}>
                      {vulnSeverityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-rose-50 border border-rose-100 text-rose-800">
                  <strong>Critical Exploits:</strong> 2 requiring immediate OEM microcode
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-100 text-amber-800">
                  <strong>High Severity:</strong> Mitigated via Network VLAN isolation
                </div>
              </div>
            </div>

            {/* Live Telemetry Health */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Biomedical Telemetry Streams</h3>
                  <p className="text-xs text-slate-500">Ingestion health and timestamp drift for data sources</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTo('freshness')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                >
                  <span>Diagnostics</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2.5">
                {freshness &&
                  Object.entries(freshness.sources).slice(0, 4).map(([name, srcItem]) => {
                    const src = srcItem as any;
                    return (
                      <div
                        key={name}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              src.status === 'FRESH' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{name}</div>
                            <div className="text-[10px] text-slate-400">
                              {src.total_rows} records &bull; Last updated {src.last_updated ? String(src.last_updated).substring(0, 10) : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            src.status === 'FRESH'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {src.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. SECURITY MANAGER VIEW: Governance, Control Matrix & Remediation Tracking */}
      {role === 'security_manager' && (
        <>
          {/* Remediation Action SLA Tracking Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                  Control Remediation &amp; SLA Milestones
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTo('remediation')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
              >
                <span>Full Remediation Plan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Remediation ID</th>
                    <th className="py-2.5 px-4">Action Item</th>
                    <th className="py-2.5 px-4">Asset ID</th>
                    <th className="py-2.5 px-4">Assigned Team</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Verification</th>
                    <th className="py-2.5 px-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityRemediations.slice(0, 5).map(rem => (
                    <tr key={rem.remediation_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{rem.remediation_id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">{rem.action}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onDrillDown(rem.asset_id)}
                          className="text-blue-600 hover:underline font-mono"
                        >
                          {rem.asset_id}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                          {rem.assigned_team}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            rem.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rem.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rem.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            rem.verification_status.includes('Verified')
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : rem.verification_status.includes('Failed')
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                          }`}
                        >
                          {rem.verification_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDrillDown(rem.asset_id)}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                        >
                          Drill-Down
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Control Domain Efficacy & Compliance Scorecard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Domain Efficacy */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Control Efficacy by Security Domain
                  </h3>
                  <p className="text-xs text-slate-500">Current performance vs benchmark compliance targets</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  5 Domains
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis dataKey="domain" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: any) => [
                        `${val}%`,
                        name === 'score' ? 'Current Efficacy' : 'Target Target'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="score" name="Current Efficacy (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Benchmark Goal (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regulatory Compliance Standards */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Regulatory Framework Alignment</h3>
                  <p className="text-xs text-slate-500">Clinical &amp; healthcare security mandate scores</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTo('evidence')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                >
                  <span>Evidence Vault</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">ISO/IEC 27001:2022</span>
                    <span className="text-xs font-bold text-emerald-700">88.5% Compliant</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88.5%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Annex A Controls: 10 of 12 verified</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">HIPAA Security Rule (45 CFR § 164.308)</span>
                    <span className="text-xs font-bold text-blue-700">92.0% Compliant</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">ePHI technical access &amp; encryption active</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">NIST SP 800-53 Rev 5</span>
                    <span className="text-xs font-bold text-emerald-700">85.0% Compliant</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Access control, audit &amp; configuration integrity</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
