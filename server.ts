import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { serverDataService } from './server/dataService.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Hospital SOC Control Effectiveness Dashboard API' });
  });

  app.get('/api/overview', (req, res) => {
    const role = (req.query.role as string) || 'management';
    const riskSummary = serverDataService.calculateRiskSummary();
    const controls = serverDataService.getControlsWithEffectiveness();
    const assets = serverDataService.getAssets();
    const vulns = serverDataService.getVulnerabilities();
    const incidents = serverDataService.getIncidents();
    const freshness = serverDataService.getFreshnessReport();

    const effectiveCount = controls.filter(c => c.rating === 'Effective').length;
    const partialCount = controls.filter(c => c.rating === 'Partially Effective').length;
    const ineffectiveCount = controls.filter(c => c.rating === 'Ineffective').length;

    const criticalAssets = assets.filter(a => a.criticality === 'Critical').length;
    const openCritVulns = vulns.filter(v => v.severity === 'Critical' && ['Open', 'In Progress'].includes(v.status)).length;
    const activeIncidents = incidents.filter(i => ['Active', 'Investigating', 'Open'].includes(i.status)).length;

    const avgCtrlEff = controls.length > 0
      ? Math.round((controls.reduce((sum, c) => sum + c.effectiveness_score, 0) / controls.length) * 10) / 10
      : 0;

    const gapToTarget = Math.round((riskSummary.hospital_current_risk - riskSummary.hospital_target_risk) * 10) / 10;

    res.json({
      role,
      kpis: {
        baseline_risk: riskSummary.hospital_baseline_risk,
        current_risk: riskSummary.hospital_current_risk,
        risk_reduction_pct: riskSummary.risk_reduction_pct,
        target_risk: riskSummary.hospital_target_risk,
        control_effectiveness_avg: avgCtrlEff,
        critical_assets_count: criticalAssets,
        open_critical_vulns_count: openCritVulns,
        active_incidents_count: activeIncidents,
        data_confidence: freshness.overall_confidence,
        management_kpis: {
          baseline_risk: riskSummary.hospital_baseline_risk,
          current_risk: riskSummary.hospital_current_risk,
          risk_reduction_pct: riskSummary.risk_reduction_pct,
          target_risk: riskSummary.hospital_target_risk,
          control_reliability_pct: avgCtrlEff,
          protected_critical_assets: criticalAssets,
          patient_safety_incidents: 0,
          compliance_posture_pct: 91.4,
          gap_to_target_pts: gapToTarget
        },
        soc_kpis: {
          active_incidents_count: activeIncidents,
          open_critical_vulns_count: openCritVulns,
          mttd_minutes: 14,
          mttr_minutes: 42,
          telemetry_health_pct: Math.round(((freshness.fresh_sources) / (freshness.fresh_sources + freshness.stale_sources)) * 1000) / 10,
          events_ingested_today: 14820,
          network_anomalies: 3,
          high_risk_endpoints: 4
        },
        manager_kpis: {
          control_coverage_score: avgCtrlEff,
          effective_controls_count: effectiveCount,
          partial_controls_count: partialCount,
          ineffective_controls_count: ineffectiveCount,
          remediation_sla_adherence: 75.0,
          cryptographic_evidence_ready: 94.0,
          framework_compliance_pct: 88.5,
          target_gap_points: gapToTarget
        }
      },
      control_breakdown: {
        effective: effectiveCount,
        partially_effective: partialCount,
        ineffective: ineffectiveCount,
        total: controls.length
      },
      risk_summary: riskSummary,
      freshness: {
        overall_confidence: freshness.overall_confidence,
        sources: freshness.sources
      }
    });
  });

  app.get('/api/controls', (req, res) => {
    res.json(serverDataService.getControlsWithEffectiveness());
  });

  app.get('/api/risks', (req, res) => {
    res.json(serverDataService.calculateRiskSummary());
  });

  app.get('/api/assets', (req, res) => {
    res.json(serverDataService.getAssets());
  });

  app.get('/api/vulnerabilities', (req, res) => {
    res.json(serverDataService.getVulnerabilities());
  });

  app.get('/api/incidents', (req, res) => {
    res.json(serverDataService.getIncidents());
  });

  app.get('/api/remediation', (req, res) => {
    res.json(serverDataService.getRemediation());
  });

  app.get('/api/telemetry', (req, res) => {
    res.json(serverDataService.getProcessedTelemetry());
  });

  app.get('/api/freshness', (req, res) => {
    res.json(serverDataService.getFreshnessReport());
  });

  app.get('/api/recommendations', (req, res) => {
    res.json(serverDataService.getRecommendations());
  });

  app.get('/api/baseline-experiment', (req, res) => {
    res.json(serverDataService.getBaselineExperiment());
  });

  app.get('/api/evidence/:id', (req, res) => {
    const id = req.params.id;
    const assets = serverDataService.getAssets();
    const controls = serverDataService.getControlsWithEffectiveness();
    const vulns = serverDataService.getVulnerabilities();
    const incidents = serverDataService.getIncidents();
    const telemetry = serverDataService.getProcessedTelemetry().events;
    const remediation = serverDataService.getRemediation();

    const asset = assets.find(a => a.asset_id === id);
    if (asset) {
      return res.json({
        entity_type: 'asset',
        entity_id: id,
        asset,
        controls: controls.filter(c => c.asset_id === id),
        vulnerabilities: vulns.filter(v => v.asset_id === id),
        incidents: incidents.filter(i => i.asset_id === id),
        telemetry: telemetry.filter(t => t.asset_id === id),
        remediation: remediation.filter(r => r.asset_id === id)
      });
    }

    const control = controls.find(c => c.control_id === id);
    if (control) {
      const parentAsset = assets.find(a => a.asset_id === control.asset_id);
      return res.json({
        entity_type: 'control',
        entity_id: id,
        control,
        asset: parentAsset,
        telemetry: telemetry.filter(t => t.control_id === id),
        incidents: incidents.filter(i => i.control_id === id)
      });
    }

    res.status(404).json({ error: `Entity '${id}' not found.` });
  });

  app.post('/api/simulate-event', (req, res) => {
    const type = req.body.anomaly_type;
    const result = serverDataService.injectSimulatedEvent(type);
    res.json(result);
  });

  app.post('/api/reset-simulation', (req, res) => {
    res.json(serverDataService.resetSimulation());
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital SOC Dashboard server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
