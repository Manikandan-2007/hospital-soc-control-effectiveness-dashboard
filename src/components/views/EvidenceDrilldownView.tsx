import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Server,
  Shield,
  Bug,
  AlertTriangle,
  Radio,
  Wrench,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Asset, Control, EntityEvidence } from '../../types';

interface EvidenceDrilldownViewProps {
  assets: Asset[];
  controls: Control[];
  initialEntityId?: string | null;
}

export const EvidenceDrilldownView: React.FC<EvidenceDrilldownViewProps> = ({
  assets,
  controls,
  initialEntityId
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialEntityId || (assets[0]?.asset_id || 'AST-ICU-001'));
  const [evidenceData, setEvidenceData] = useState<EntityEvidence | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetch(`/api/evidence/${encodeURIComponent(selectedId)}`)
      .then(res => res.json())
      .then(data => {
        setEvidenceData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [selectedId]);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Audit-Ready Evidence &amp; Traceability Chain
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deep forensic verification connecting medical device assets to live telemetry heartbeats, CVEs, incidents, and remediation actions.
          </p>
        </div>

        {/* Entity Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="evidence-entity-select" className="text-xs text-slate-500 font-medium">Select Entity:</label>
          <select
            id="evidence-entity-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="bg-slate-50 text-xs text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-blue-500 font-mono shadow-xs"
          >
            <optgroup label="Medical Devices &amp; Clinical Systems">
              {assets.map(a => (
                <option key={a.asset_id} value={a.asset_id}>
                  {a.asset_id} - {a.asset_name} ({a.criticality})
                </option>
              ))}
            </optgroup>
            <optgroup label="Hospital Security Controls">
              {controls.map(c => (
                <option key={c.control_id} value={c.control_id}>
                  {c.control_id} - {c.control_name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Retrieving full telemetry and audit trails...</span>
        </div>
      )}

      {evidenceData && !loading && (
        <div className="space-y-5">
          {/* Step Sequence Visualizer */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-xs">
              <div className="font-bold text-blue-700">1. Asset Spec</div>
              <div className="text-[11px] text-slate-500 truncate">{evidenceData.asset?.asset_name || 'System'}</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="font-bold text-indigo-700">2. Controls</div>
              <div className="text-[11px] text-slate-500">{evidenceData.controls?.length || 0} active</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="font-bold text-emerald-700">3. Telemetry</div>
              <div className="text-[11px] text-slate-500">{evidenceData.telemetry?.length || 0} signals</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="font-bold text-rose-700">4. CVEs</div>
              <div className="text-[11px] text-slate-500">{evidenceData.vulnerabilities?.length || 0} flaws</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="font-bold text-amber-700">5. Incidents</div>
              <div className="text-[11px] text-slate-500">{evidenceData.incidents?.length || 0} logged</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="font-bold text-purple-700">6. Verification</div>
              <div className="text-[11px] text-slate-500">{evidenceData.remediation?.length || 0} tickets</div>
            </div>
          </div>

          {/* Asset & Risk Summary Card */}
          {evidenceData.asset && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {evidenceData.asset.asset_id}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      evidenceData.asset.criticality === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {evidenceData.asset.criticality} Criticality
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{evidenceData.asset.asset_name}</h3>
                  <p className="text-xs text-slate-700 italic mt-1 bg-slate-50 p-2.5 rounded border border-slate-100 max-w-2xl">
                    Clinical Purpose: &ldquo;{evidenceData.asset.business_function}&rdquo;
                  </p>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>Ward: <strong className="text-slate-900">{evidenceData.asset.department}</strong></div>
                  <div>Location: <span className="text-slate-700">{evidenceData.asset.location}</span></div>
                  <div>Lead: <span className="text-slate-700">{evidenceData.asset.owner}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Two-Column Deep Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column: Controls & Telemetry */}
            <div className="space-y-5">
              {/* Controls */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Enforcing Technical Security Controls ({evidenceData.controls?.length || 0})</span>
                </div>

                {(!evidenceData.controls || evidenceData.controls.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No controls assigned to this asset.</p>
                ) : (
                  <div className="space-y-3">
                    {evidenceData.controls.map(c => (
                      <div key={c.control_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900">{c.control_name}</span>
                            <div className="text-[11px] text-slate-500">{c.control_type} &bull; Status: {c.implementation_status}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            c.rating === 'Effective'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {c.effectiveness_score}%
                          </span>
                        </div>
                        {c.evidence && (
                          <div className="p-2 rounded bg-white border border-slate-200/60 text-[11px] text-slate-600">
                            <strong className="text-slate-800">Audit evidence:</strong> {c.evidence.join('; ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Telemetry Stream */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <Radio className="w-4 h-4" />
                  <span>Recent Telemetry Signals ({evidenceData.telemetry?.length || 0})</span>
                </div>

                {(!evidenceData.telemetry || evidenceData.telemetry.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No telemetry recorded for this entity.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {evidenceData.telemetry.map(t => (
                      <div key={t.event_id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 mr-2">{t.event_timestamp}</span>
                          <span className="text-blue-700 font-semibold">{t.event_type}</span>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">Source: {t.source}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                          t.control_status === 'control_success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {t.control_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Flaws, Incidents & Remediation */}
            <div className="space-y-5">
              {/* Vulnerabilities */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
                  <Bug className="w-4 h-4" />
                  <span>Discovered Vulnerabilities &amp; CVEs ({evidenceData.vulnerabilities?.length || 0})</span>
                </div>

                {(!evidenceData.vulnerabilities || evidenceData.vulnerabilities.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No active or resolved CVEs identified.</p>
                ) : (
                  <div className="space-y-2">
                    {evidenceData.vulnerabilities.map(v => (
                      <div key={v.vulnerability_id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold font-mono text-slate-900">{v.vulnerability_id}</div>
                          <div className="text-[11px] text-slate-500">CVSS: {v.cvss_score} &bull; Status: {v.status}</div>
                          {v.remediation_due_date && (
                            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Due: {v.remediation_due_date} ({v.remediation_status})</div>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.severity === 'Critical' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          {v.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Incidents */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>SOC Incident Containment History ({evidenceData.incidents?.length || 0})</span>
                </div>

                {(!evidenceData.incidents || evidenceData.incidents.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No security incidents detected on this asset.</p>
                ) : (
                  <div className="space-y-2">
                    {evidenceData.incidents.map(inc => (
                      <div key={inc.incident_id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{inc.incident_type}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 italic">&ldquo;{inc.impact_level}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remediation */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
                  <Wrench className="w-4 h-4" />
                  <span>Clinical Remediation &amp; Validation ({evidenceData.remediation?.length || 0})</span>
                </div>

                {(!evidenceData.remediation || evidenceData.remediation.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No remediation tasks entered.</p>
                ) : (
                  <div className="space-y-2">
                    {evidenceData.remediation.map(r => (
                      <div key={r.remediation_id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{r.action}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.verification_status.includes('Verified') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {r.verification_status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Team: {r.assigned_team} &bull; Completed: {r.completed_date || 'In progress'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
