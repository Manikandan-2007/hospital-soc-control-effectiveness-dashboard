import React, { useState } from 'react';
import { Bug, Search, Filter, AlertTriangle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { Vulnerability, Asset } from '../../types';

interface VulnerabilitiesViewProps {
  vulnerabilities: Vulnerability[];
  assets: Asset[];
  onDrillDown: (assetId: string) => void;
}

export const VulnerabilitiesView: React.FC<VulnerabilitiesViewProps> = ({
  vulnerabilities,
  assets,
  onDrillDown
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assetMap = new Map<string, Asset>(assets.map(a => [a.asset_id, a]));

  const filteredVulns = vulnerabilities.filter(v => {
    if (severityFilter !== 'all' && v.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && v.remediation_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const asset = assetMap.get(v.asset_id);
      return (
        v.vulnerability_id.toLowerCase().includes(q) ||
        v.asset_id.toLowerCase().includes(q) ||
        (asset && asset.asset_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getBusinessImpact = (v: Vulnerability, asset?: Asset) => {
    if (!asset) return 'Unmapped asset risk.';
    if (v.severity === 'Critical') {
      return `Potential lateral compromise or forced restart of ${asset.asset_name} in ${asset.department}, halting immediate clinical procedures.`;
    }
    if (v.severity === 'High') {
      return `Risk of telemetry interception, delayed alarm routing, or unauthorized service mode access.`;
    }
    return 'Low-impact reconnaissance exposure; perimeter containment active.';
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Vulnerability Queue &amp; Clinical Impact Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Correlating CVSS technical exploitability with hospital business impact and remediation SLAs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            {vulnerabilities.filter(v => v.severity === 'Critical').length} Critical CVEs
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
            {vulnerabilities.filter(v => v.remediation_status === 'Overdue').length} Overdue SLA
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 flex-wrap gap-y-1">
            <span className="text-xs text-slate-500 mr-1 font-medium">Severity:</span>
            {['all', 'Critical', 'High', 'Medium', 'Low'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  severityFilter === s ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 flex-wrap gap-y-1">
            <span className="text-xs text-slate-500 mr-1 font-medium">Status:</span>
            {['all', 'Completed', 'In Progress', 'Overdue', 'Open'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  statusFilter === st ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search CVE, Asset ID, or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Vulnerability Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Vulnerability</th>
                <th className="p-3.5">Severity / CVSS</th>
                <th className="p-3.5">Target Medical Asset</th>
                <th className="p-3.5">Clinical Business Impact</th>
                <th className="p-3.5">Remediation Status</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVulns.map(v => {
                const asset = assetMap.get(v.asset_id);
                const isOverdue = v.remediation_status === 'Overdue';

                return (
                  <tr key={v.vulnerability_id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 font-mono">{v.vulnerability_id}</div>
                      <div className="text-[10px] text-slate-400">Detected: {v.detected_date}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.severity === 'Critical'
                            ? 'bg-rose-500 text-white'
                            : v.severity === 'High'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {v.severity}
                        </span>
                        <span className="font-bold text-slate-800">{v.cvss_score}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{asset?.asset_name || v.asset_id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{v.asset_id} ({asset?.department})</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {getBusinessImpact(v, asset)}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1 ${
                        v.remediation_status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {v.remediation_status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                        {isOverdue && <Clock className="w-3 h-3" />}
                        <span>{v.remediation_status}</span>
                      </span>
                      {v.remediation_completed_date && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Done: {v.remediation_completed_date}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono">
                      {v.remediation_due_date || 'N/A'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onDrillDown(v.asset_id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-semibold border border-slate-200 inline-flex items-center space-x-1 transition shadow-xs"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
