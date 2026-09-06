import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, Search, Filter, ArrowUpRight, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Incident, Asset, Control } from '../../types';

interface IncidentsViewProps {
  incidents: Incident[];
  assets: Asset[];
  controls: Control[];
  onDrillDown: (id: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  assets,
  controls,
  onDrillDown
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assetMap = new Map<string, Asset>(assets.map(a => [a.asset_id, a]));
  const controlMap = new Map<string, Control>(controls.map(c => [c.control_id, c]));

  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const asset = assetMap.get(inc.asset_id);
      return (
        inc.incident_id.toLowerCase().includes(q) ||
        inc.incident_type.toLowerCase().includes(q) ||
        inc.asset_id.toLowerCase().includes(q) ||
        (asset && asset.asset_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Hospital SOC Incident Telemetry &amp; Containment Feed
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time security events captured across biomedical network segments, endpoint sensors, and identity providers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
            {incidents.filter(i => ['Active', 'Investigating'].includes(i.status)).length} Active Threats
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            {incidents.filter(i => ['Resolved', 'Contained'].includes(i.status)).length} Contained / Resolved
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 flex-wrap gap-y-1">
          <span className="text-xs text-slate-500 mr-1 font-medium">Incident Status:</span>
          {['all', 'Active', 'Investigating', 'Contained', 'Resolved'].map(st => (
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

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident ID, asset, type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Incident ID / Type</th>
                <th className="p-3.5">Target Clinical Asset</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Containment / Control</th>
                <th className="p-3.5">Detection &amp; Resolution Times</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIncidents.map(inc => {
                const asset = assetMap.get(inc.asset_id);
                const control = controlMap.get(inc.control_id);

                return (
                  <tr key={inc.incident_id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs">{inc.incident_type}</div>
                      <div className="font-mono text-[11px] text-slate-400">{inc.incident_id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{asset?.asset_name || inc.asset_id}</div>
                      <div className="text-[11px] text-slate-400">{asset?.department} &bull; {asset?.criticality}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'Critical'
                          ? 'bg-rose-500 text-white'
                          : inc.severity === 'High'
                          ? 'bg-orange-500 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">{control?.control_name || inc.control_id}</div>
                      <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">{inc.impact_level}</p>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      <div>Det: {inc.detected_time}</div>
                      <div className="text-slate-400">Res: {inc.resolved_time || 'Investigating'}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1 ${
                        inc.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inc.status === 'Contained'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                      }`}>
                        {inc.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{inc.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onDrillDown(inc.asset_id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-semibold border border-slate-200 inline-flex items-center space-x-1 transition shadow-xs"
                      >
                        <span>Evidence</span>
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
