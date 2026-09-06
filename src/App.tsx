import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, PageId } from './components/Sidebar';
import { EvidenceModal } from './components/EvidenceModal';
import { ExecutiveOverviewView } from './components/views/ExecutiveOverviewView';
import { ControlEffectivenessView } from './components/views/ControlEffectivenessView';
import { RiskAnalysisView } from './components/views/RiskAnalysisView';
import { AssetsView } from './components/views/AssetsView';
import { VulnerabilitiesView } from './components/views/VulnerabilitiesView';
import { IncidentsView } from './components/views/IncidentsView';
import { RemediationView } from './components/views/RemediationView';
import { DataFreshnessView } from './components/views/DataFreshnessView';
import { EvidenceDrilldownView } from './components/views/EvidenceDrilldownView';
import { FailureCaseTestingView } from './components/views/FailureCaseTestingView';
import { FieldWorkflowView } from './components/views/FieldWorkflowView';

import {
  Role,
  Asset,
  Control,
  Vulnerability,
  Incident,
  Remediation,
  FreshnessReport,
  RiskSummary,
  Recommendation,
  OverviewKPIs
} from './types';

export function App() {
  const [currentRole, setCurrentRole] = useState<Role>('management');
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [drillDownEntityId, setDrillDownEntityId] = useState<string | null>(null);

  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [remediation, setRemediation] = useState<Remediation[]>([]);
  const [freshness, setFreshness] = useState<FreshnessReport | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    setError(null);

    try {
      const [
        overviewRes,
        controlsRes,
        risksRes,
        assetsRes,
        vulnsRes,
        incidentsRes,
        remRes,
        freshnessRes,
        recsRes
      ] = await Promise.all([
        fetch(`/api/overview?role=${currentRole}`),
        fetch('/api/controls'),
        fetch('/api/risks'),
        fetch('/api/assets'),
        fetch('/api/vulnerabilities'),
        fetch('/api/incidents'),
        fetch('/api/remediation'),
        fetch('/api/freshness'),
        fetch('/api/recommendations')
      ]);

      if (!overviewRes.ok || !controlsRes.ok) {
        throw new Error('Failed to load telemetry from Hospital SOC backend');
      }

      const overviewData = await overviewRes.json();
      const controlsData = await controlsRes.json();
      const risksData = await risksRes.json();
      const assetsData = await assetsRes.json();
      const vulnsData = await vulnsRes.json();
      const incidentsData = await incidentsRes.json();
      const remData = await remRes.json();
      const freshnessData = await freshnessRes.json();
      const recsData = await recsRes.json();

      setKpis(overviewData.kpis);
      setRiskSummary(risksData);
      setControls(controlsData);
      setAssets(assetsData);
      setVulnerabilities(vulnsData);
      setIncidents(incidentsData);
      setRemediation(remData);
      setFreshness(freshnessData);
      setRecommendations(recsData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error communicating with SOC services');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentRole]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDrillDown = (id: string) => {
    setDrillDownEntityId(id);
  };

  const handleCloseDrillDown = () => {
    setDrillDownEntityId(null);
  };

  const activeIncidentsCount = kpis?.active_incidents_count ?? 0;
  const openCriticalVulnsCount = kpis?.open_critical_vulns_count ?? 0;
  const staleFeedsCount = freshness?.stale_sources ?? 0;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={role => {
          setCurrentRole(role);
          // Optional smart redirect if user picks a role suited for specific tasks
        }}
        freshness={freshness}
        onRefresh={() => fetchAllData(true)}
        isRefreshing={isRefreshing}
        activeIncidentsCount={activeIncidentsCount}
        openCriticalVulnsCount={openCriticalVulnsCount}
      />

      {/* Main Container with Sidebar + Page Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          currentRole={currentRole}
          counts={{
            activeIncidents: activeIncidentsCount,
            openCriticalVulns: openCriticalVulnsCount,
            staleFeeds: staleFeedsCount
          }}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
                <span>SOC Communications Error: {error}</span>
                <button
                  type="button"
                  onClick={() => fetchAllData(true)}
                  className="px-3 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="py-24 text-center text-slate-500">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-800">
                  Connecting to Hospital SOC Telemetry Streams...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Validating assets, evaluating controls, and calculating inherent vs residual risk
                </p>
              </div>
            ) : (
              <>
                {currentPage === 'overview' && (
                  <ExecutiveOverviewView
                    kpis={kpis}
                    riskSummary={riskSummary}
                    recommendations={recommendations}
                    controls={controls}
                    assets={assets}
                    vulnerabilities={vulnerabilities}
                    incidents={incidents}
                    remediation={remediation}
                    freshness={freshness}
                    role={currentRole}
                    onDrillDown={handleDrillDown}
                    onNavigateTo={setCurrentPage}
                  />
                )}

                {currentPage === 'controls' && (
                  <ControlEffectivenessView
                    controls={controls}
                    onDrillDown={handleDrillDown}
                  />
                )}

                {currentPage === 'risks' && (
                  <RiskAnalysisView
                    riskSummary={riskSummary}
                    onDrillDown={handleDrillDown}
                  />
                )}

                {currentPage === 'assets' && (
                  <AssetsView
                    assets={assets}
                    controls={controls}
                    onDrillDown={handleDrillDown}
                  />
                )}

                {currentPage === 'vulnerabilities' && (
                  <VulnerabilitiesView
                    vulnerabilities={vulnerabilities}
                    assets={assets}
                    onDrillDown={handleDrillDown}
                  />
                )}

                {currentPage === 'incidents' && (
                  <IncidentsView
                    incidents={incidents}
                    assets={assets}
                    controls={controls}
                    onDrillDown={handleDrillDown}
                  />
                )}

                {currentPage === 'remediation' && (
                  <RemediationView
                    remediation={remediation}
                    assets={assets}
                    onDrillDown={handleDrillDown}
                  />
                )}

                {currentPage === 'freshness' && (
                  <DataFreshnessView
                    freshness={freshness}
                    onRefresh={() => fetchAllData(true)}
                    isRefreshing={isRefreshing}
                  />
                )}

                {currentPage === 'evidence' && (
                  <EvidenceDrilldownView
                    assets={assets}
                    controls={controls}
                    initialEntityId={drillDownEntityId}
                  />
                )}

                {currentPage === 'failure_testing' && (
                  <FailureCaseTestingView />
                )}

                {currentPage === 'workflow' && (
                  <FieldWorkflowView />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Audit Evidence Drill-down Modal */}
      <EvidenceModal
        entityId={drillDownEntityId}
        onClose={handleCloseDrillDown}
      />
    </div>
  );
}

export default App;
