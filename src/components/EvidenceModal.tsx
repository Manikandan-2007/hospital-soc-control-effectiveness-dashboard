import React, { useEffect, useState } from 'react';
import { X, Shield, Bug, AlertTriangle, Radio, Wrench, CheckCircle, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { EntityEvidence } from '../types';

interface EvidenceModalProps {
  entityId: string | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ entityId, onClose }) => {
  const [data, setData] = useState<EntityEvidence | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/evidence/${encodeURIComponent(entityId)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Evidence entity '${entityId}' not found`);
        return res.json();
      })
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [entityId]);

  if (!entityId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Audit Evidence Drill-down Chain
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
                  {entityId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                End-to-end trace from asset telemetry to executive risk contribution
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {loading && (
            <div className="py-16 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Compiling cryptographic &amp; telemetry audit trail...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              <div className="font-semibold mb-1">Evidence Compilation Error</div>
              <div>{error}</div>
            </div>
          )}

          {data && data.entity_type === 'asset' && data.asset && (
            <div className="space-y-6">
              {/* Step 1: Asset Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">1. Asset Specification</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    data.asset.criticality === 'Critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : data.asset.criticality === 'High'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    Criticality: {data.asset.criticality}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Name:</span> <strong className="text-slate-900">{data.asset.asset_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Department:</span> <strong className="text-slate-900">{data.asset.department}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Location:</span> <span className="text-slate-700">{data.asset.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Owner:</span> <span className="text-slate-700">{data.asset.owner}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500">Clinical Function:</span>{' '}
                    <span className="text-slate-700 italic">{data.asset.business_function}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Associated Controls */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>2. Assigned Security Controls ({data.controls?.length || 0})</span>
                </div>
                {(!data.controls || data.controls.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No security controls assigned to this asset.</p>
                ) : (
                  <div className="space-y-2">
                    {data.controls.map(c => (
                      <div key={c.control_id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{c.control_name}</div>
                          <div className="text-[11px] text-slate-500">
                            Type: {c.control_type} &bull; Status: {c.implementation_status} &bull; Verified: {c.last_verified || 'Never'}
                          </div>
                          {c.evidence && c.evidence.length > 0 && (
                            <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-600 list-disc list-inside">
                              {c.evidence.map((ev, i) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          c.rating === 'Effective'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.rating === 'Partially Effective'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {c.effectiveness_score}% ({c.rating})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Associated Vulnerabilities */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
                  <Bug className="w-4 h-4 text-rose-600" />
                  <span>3. Associated Vulnerabilities ({data.vulnerabilities?.length || 0})</span>
                </div>
                {(!data.vulnerabilities || data.vulnerabilities.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No vulnerabilities identified for this asset.</p>
                ) : (
                  <div className="space-y-2">
                    {data.vulnerabilities.map(v => (
                      <div key={v.vulnerability_id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-slate-900 mr-2">{v.vulnerability_id}</span>
                          <span className="text-slate-500">CVSS: {v.cvss_score} &bull; Detected: {v.detected_date}</span>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Status: <strong className={v.remediation_status === 'Overdue' ? 'text-rose-600' : 'text-slate-800'}>{v.remediation_status}</strong>
                            {v.remediation_due_date && ` (Due: ${v.remediation_due_date})`}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          v.severity === 'Critical' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          {v.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Associated Incidents */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>4. SOC Incident History ({data.incidents?.length || 0})</span>
                </div>
                {(!data.incidents || data.incidents.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">Zero historical incidents on this asset.</p>
                ) : (
                  <div className="space-y-2">
                    {data.incidents.map(inc => (
                      <div key={inc.incident_id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{inc.incident_type} ({inc.incident_id})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inc.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-1">
                          Detected: {inc.detected_time} &bull; Severity: {inc.severity}
                        </div>
                        <p className="text-slate-700 text-[11px] mt-1 bg-slate-100 p-1.5 rounded border border-slate-200">
                          {inc.impact_level}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 5: Telemetry Stream */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>5. Control Telemetry Heartbeats &amp; Logs ({data.telemetry?.length || 0})</span>
                </div>
                {(!data.telemetry || data.telemetry.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No direct telemetry records available.</p>
                ) : (
                  <div className="space-y-1.5">
                    {data.telemetry.map(t => (
                      <div key={t.event_id} className="px-3 py-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-500 mr-2">{t.event_timestamp}</span>
                          <span className="text-blue-700 font-semibold">{t.event_type}</span>
                          <span className="text-slate-500 text-[11px] ml-2">via {t.source}</span>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-sans font-semibold ${
                          t.control_status === 'control_success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {t.control_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 6: Remediation History */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <span>6. Remediation Actions ({data.remediation?.length || 0})</span>
                </div>
                {(!data.remediation || data.remediation.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No formal remediation records entered.</p>
                ) : (
                  <div className="space-y-2">
                    {data.remediation.map(r => (
                      <div key={r.remediation_id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-900">{r.action}</span>
                          <span className="text-purple-700 font-medium">{r.verification_status}</span>
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
          )}

          {data && data.entity_type === 'control' && data.control && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Control Profile</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    data.control.rating === 'Effective'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : data.control.rating === 'Partially Effective'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {data.control.effectiveness_score}% ({data.control.rating})
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mb-1">{data.control.control_name}</div>
                <div className="text-xs text-slate-500">
                  Control Type: {data.control.control_type} &bull; Status: {data.control.implementation_status} &bull; Last Verified: {data.control.last_verified || 'Pending'}
                </div>
                {data.control.evidence && (
                  <div className="mt-3 bg-white p-3 rounded border border-slate-200 text-xs space-y-1">
                    <strong className="text-slate-800">Audited Evidence:</strong>
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      {data.control.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {data.asset && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Target Protected Asset</span>
                  <div className="mt-2 text-xs grid grid-cols-2 gap-2">
                    <div>Asset Name: <strong className="text-slate-900">{data.asset.asset_name}</strong></div>
                    <div>Department: <strong className="text-slate-900">{data.asset.department}</strong></div>
                    <div>Criticality: <strong className="text-rose-600">{data.asset.criticality}</strong></div>
                    <div>Function: <span className="text-slate-600 italic">{data.asset.business_function}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition shadow-xs"
          >
            Close Drill-down
          </button>
        </div>
      </div>
    </div>
  );
};
