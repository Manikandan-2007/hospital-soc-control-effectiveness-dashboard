import React, { useState } from 'react';
import { Wrench, CheckCircle, Clock, AlertCircle, Search, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Remediation, Asset } from '../../types';

interface RemediationViewProps {
  remediation: Remediation[];
  assets: Asset[];
  onDrillDown: (assetId: string) => void;
}

export const RemediationView: React.FC<RemediationViewProps> = ({
  remediation,
  assets,
  onDrillDown
}) => {
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assetMap = new Map<string, Asset>(assets.map(a => [a.asset_id, a]));

  const filtered = remediation.filter(r => {
    if (filterVerification !== 'all') {
      if (!r.verification_status.toLowerCase().includes(filterVerification.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const asset = assetMap.get(r.asset_id);
      return (
        r.action.toLowerCase().includes(q) ||
        r.remediation_id.toLowerCase().includes(q) ||
        r.assigned_team.toLowerCase().includes(q) ||
        (asset && asset.asset_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const verifiedCount = remediation.filter(r => r.verification_status.includes('Verified')).length;
  const pendingCount = remediation.filter(r => r.verification_status.includes('Pending')).length;
  const failedCount = remediation.filter(r => r.verification_status.includes('Failed')).length;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Remediation &amp; Clinical Verification Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking biomedical engineering patch execution, network firewall updates, and clinical validation signs.
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            {verifiedCount} Verified Effective
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
            {pendingCount} Pending Verification
          </span>
          {failedCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
              {failedCount} Failed Verification
            </span>
          )}
        </div>
      </div>

      {/* Verification Rule Notice */}
      <div className="bg-blue-50/40 border border-blue-200 p-4 rounded-xl flex items-center space-x-3 text-xs text-slate-700 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <strong className="text-slate-900 block font-semibold">Verification Requirement for Risk Reduction:</strong>
          <span>
            Under the hospital risk framework, patching actions only reduce residual risk once Clinical Engineering or Biomedical IT verifies that clinical workflows and device safety alarms remain 100% operational.
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 flex-wrap gap-y-1">
          <span className="text-xs text-slate-500 mr-1 font-medium">Verification:</span>
          {['all', 'Verified', 'Pending', 'Failed'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterVerification(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                filterVerification === st ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, team, or asset..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Action / ID</th>
                <th className="p-3.5">Target Medical Asset</th>
                <th className="p-3.5">Assigned Team</th>
                <th className="p-3.5">Timestamps</th>
                <th className="p-3.5">Execution Status</th>
                <th className="p-3.5">Clinical Verification</th>
                <th className="p-3.5 text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(r => {
                const asset = assetMap.get(r.asset_id);
                const isVerified = r.verification_status.includes('Verified');

                return (
                  <tr key={r.remediation_id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 max-w-sm">
                      <div className="font-bold text-slate-900 text-xs">{r.action}</div>
                      <div className="font-mono text-[10px] text-slate-400">ID: {r.remediation_id} &bull; Vuln: {r.vulnerability_id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{asset?.asset_name || r.asset_id}</div>
                      <div className="text-[11px] text-slate-400">{r.asset_id} ({asset?.department})</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {r.assigned_team}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      <div>Start: {r.started_date}</div>
                      <div className="text-slate-400">Done: {r.completed_date || 'In Progress'}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1 ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isVerified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{r.verification_status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onDrillDown(r.asset_id)}
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
