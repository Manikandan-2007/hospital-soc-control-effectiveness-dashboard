import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, HelpCircle, ArrowUpRight, Search, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Control } from '../../types';

interface ControlEffectivenessViewProps {
  controls: Control[];
  onDrillDown: (id: string) => void;
}

export const ControlEffectivenessView: React.FC<ControlEffectivenessViewProps> = ({
  controls,
  onDrillDown
}) => {
  const [filterRating, setFilterRating] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredControls = controls.filter(c => {
    if (filterRating !== 'all' && c.rating !== filterRating) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.control_name.toLowerCase().includes(q) ||
        c.control_type.toLowerCase().includes(q) ||
        c.asset_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const chartData = controls.map(c => ({
    name: c.control_name.length > 20 ? c.control_name.substring(0, 18) + '...' : c.control_name,
    fullName: c.control_name,
    score: c.effectiveness_score,
    rating: c.rating,
    id: c.control_id
  }));

  const getBarColor = (rating?: string) => {
    if (rating === 'Effective') return '#10b981';
    if (rating === 'Partially Effective') return '#f59e0b';
    if (rating === 'Ineffective') return '#ef4444';
    return '#64748b';
  };

  const counts = {
    total: controls.length,
    effective: controls.filter(c => c.rating === 'Effective').length,
    partiallyEffective: controls.filter(c => c.rating === 'Partially Effective').length,
    ineffective: controls.filter(c => c.rating === 'Ineffective').length,
    unknown: controls.filter(c => c.rating === 'Unknown').length
  };

  return (
    <div className="space-y-5">
      {/* Title & Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Hospital Security Control Effectiveness
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Continuous validation using real-time telemetry heartbeats, incident containment rates, and clinical engineering verification.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              {counts.effective} Effective
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
              {counts.partiallyEffective} Partial
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
              {counts.ineffective} Ineffective
            </span>
          </div>
        </div>
      </div>

      {/* Effectiveness Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Control Effectiveness Distribution (0 - 100%)
            </h3>
            <p className="text-xs text-slate-500">
              Benchmark: Effective (&ge;80%), Partially Effective (50-79%), Ineffective (&lt;50%)
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(val: any, name: any, item: any) => [
                  `${val}% (${item.payload.rating})`,
                  item.payload.fullName
                ]}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.rating)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex space-x-1 flex-wrap gap-y-1">
            {['all', 'Effective', 'Partially Effective', 'Ineffective', 'Unknown'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterRating(tab)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  filterRating === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? 'All Controls' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search controls or assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Detailed Controls Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Control ID / Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Protected Asset</th>
                <th className="p-3.5">Implementation</th>
                <th className="p-3.5">Telemetry Signals</th>
                <th className="p-3.5">Effectiveness</th>
                <th className="p-3.5 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredControls.map(c => (
                <tr key={c.control_id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 text-xs">{c.control_name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{c.control_id}</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-600">
                    {c.control_type}
                  </td>
                  <td className="p-3.5 font-mono text-blue-600">
                    <button
                      type="button"
                      onClick={() => onDrillDown(c.asset_id)}
                      className="hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <span>{c.asset_id}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.implementation_status === 'Implemented'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : c.implementation_status === 'Partially Implemented'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {c.implementation_status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Verified: {c.last_verified || 'Pending'}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-800">
                      Success: <strong>{c.telemetry_summary?.success || 0}</strong> &bull; Fail: <strong>{c.telemetry_summary?.failure || 0}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Total: {c.telemetry_summary?.total_events || 0} events
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{c.effectiveness_score}%</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.rating === 'Effective'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.rating === 'Partially Effective'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {c.rating}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDrillDown(c.control_id)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-semibold border border-slate-200 inline-flex items-center space-x-1 transition shadow-xs"
                    >
                      <span>Evidence</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
