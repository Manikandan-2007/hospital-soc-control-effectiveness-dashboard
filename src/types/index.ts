export type Role = 'management' | 'soc_analyst' | 'security_manager';

export type Criticality = 'Critical' | 'High' | 'Medium' | 'Low';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type FreshnessStatus = 'FRESH' | 'STALE' | 'MISSING' | 'DELAYED' | 'ERROR';

export interface Asset {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  department: string;
  criticality: Criticality;
  business_function: string;
  location: string;
  owner: string;
  last_updated: string;
}

export interface Control {
  control_id: string;
  control_name: string;
  control_type: string;
  asset_id: string;
  implementation_status: string;
  implementation_date: string;
  effectiveness_score: number;
  last_verified: string;
  rating?: 'Effective' | 'Partially Effective' | 'Ineffective' | 'Unknown';
  evidence?: string[];
  telemetry_summary?: {
    total_events: number;
    success: number;
    failure: number;
  };
}

export interface Vulnerability {
  vulnerability_id: string;
  asset_id: string;
  severity: Severity;
  cvss_score: number;
  status: string;
  detected_date: string;
  remediation_due_date: string;
  remediation_status: string;
  remediation_completed_date: string;
}

export interface Incident {
  incident_id: string;
  asset_id: string;
  incident_type: string;
  severity: Severity;
  detected_time: string;
  resolved_time: string;
  status: string;
  control_id: string;
  impact_level: string;
}

export interface ControlTelemetry {
  event_id: string;
  control_id: string;
  asset_id: string;
  event_timestamp: string;
  event_type: string;
  control_status: string;
  source: string;
  processing_timestamp: string;
  is_delayed?: boolean;
  latency_hours?: number;
}

export interface Remediation {
  remediation_id: string;
  vulnerability_id: string;
  asset_id: string;
  action: string;
  status: string;
  assigned_team: string;
  started_date: string;
  completed_date: string;
  verification_status: string;
}

export interface SourceFreshness {
  source: string;
  exists: boolean;
  total_rows: number;
  valid_rows: number;
  status: FreshnessStatus;
  freshness_message: string;
  last_updated: string | null;
  missing_fields?: string[];
}

export interface FreshnessReport {
  overall_confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  fresh_sources: number;
  stale_sources: number;
  missing_sources: number;
  sources: Record<string, SourceFreshness>;
}

export interface AssetRiskProfile {
  asset_id: string;
  asset_name: string;
  criticality: Criticality;
  department: string;
  baseline_risk: number;
  current_risk: number;
  reduction_pct: number;
  risk_tier: string;
  unresolved_vulnerabilities: number;
  active_incidents: number;
  control_count: number;
  avg_control_effectiveness: number;
}

export interface CriticalityBreakdown {
  criticality: Criticality;
  asset_count: number;
  baseline_risk: number;
  current_risk: number;
  risk_reduction_pct: number;
  current_tier: string;
}

export interface RiskSummary {
  hospital_baseline_risk: number;
  hospital_current_risk: number;
  hospital_target_risk: number;
  risk_reduction_pct: number;
  baseline_tier: string;
  current_tier: string;
  criticality_breakdown: CriticalityBreakdown[];
  asset_risk_profiles: AssetRiskProfile[];
}

export interface Recommendation {
  id: string;
  title: string;
  priority: string;
  target_role: string;
  category: string;
  related_asset_id?: string;
  related_control_id?: string;
  what_is_happening: string;
  why_it_matters: string;
  what_should_be_done: string;
  evidence: string[];
}

export interface BaselineExperimentResult {
  experiment_name: string;
  date_executed: string;
  baseline_risk: number;
  target_risk: number;
  measured_current_risk: number;
  absolute_difference: number;
  risk_reduction_pct: number;
  target_gap: number;
  target_achieved: boolean;
  uncertainty_margin_pts: number;
  uncertainty_explanation: string;
  attributions: Array<{
    control_id: string;
    control_name: string;
    control_type: string;
    asset_id: string;
    effectiveness_score: number;
    attributed_reduction_points: number;
    evidence_summary: string;
    attribution_statement: string;
  }>;
}

export interface ManagementKPIs {
  baseline_risk: number;
  current_risk: number;
  risk_reduction_pct: number;
  target_risk: number;
  control_reliability_pct: number;
  protected_critical_assets: number;
  patient_safety_incidents: number;
  compliance_posture_pct: number;
  gap_to_target_pts: number;
}

export interface SocAnalystKPIs {
  active_incidents_count: number;
  open_critical_vulns_count: number;
  mttd_minutes: number;
  mttr_minutes: number;
  telemetry_health_pct: number;
  events_ingested_today: number;
  network_anomalies: number;
  high_risk_endpoints: number;
}

export interface SecurityManagerKPIs {
  control_coverage_score: number;
  effective_controls_count: number;
  partial_controls_count: number;
  ineffective_controls_count: number;
  remediation_sla_adherence: number;
  cryptographic_evidence_ready: number;
  framework_compliance_pct: number;
  target_gap_points: number;
}

export interface OverviewKPIs {
  baseline_risk: number;
  current_risk: number;
  risk_reduction_pct: number;
  target_risk: number;
  control_effectiveness_avg: number;
  critical_assets_count: number;
  open_critical_vulns_count: number;
  active_incidents_count: number;
  data_confidence: string;
  management_kpis?: ManagementKPIs;
  soc_kpis?: SocAnalystKPIs;
  manager_kpis?: SecurityManagerKPIs;
}

export interface EntityEvidence {
  entity_type: 'asset' | 'control';
  entity_id: string;
  asset?: Asset;
  control?: Control;
  controls?: Control[];
  vulnerabilities?: Vulnerability[];
  incidents?: Incident[];
  telemetry?: ControlTelemetry[];
  remediation?: Remediation[];
}
