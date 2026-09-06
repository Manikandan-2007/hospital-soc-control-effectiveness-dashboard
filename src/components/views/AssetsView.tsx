import React, { useState } from 'react';
import { Server, Search, Filter, ArrowUpRight, Shield, Activity, MapPin, User } from 'lucide-react';
import { Asset, Control } from '../../types';

interface AssetsViewProps {
  assets: Asset[];
  controls: Control[];
  onDrillDown: (assetId: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ assets, controls, onDrillDown }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const departments = Array.from(new Set(assets.map(a => a.department))).sort();

  const filteredAssets = assets.filter(a => {
    if (criticalityFilter !== 'all' && a.criticality !== criticalityFilter) return false;
    if (departmentFilter !== 'all' && a.department !== departmentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.asset_name.toLowerCase().includes(q) ||
        a.asset_id.toLowerCase().includes(q) ||
        a.business_function.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
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
            Medical Devices &amp; Clinical Application Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Life-support monitors, infusion systems, imaging modalities, EHR databases, and pharmacy dispensers.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Showing <strong>{filteredAssets.length}</strong> of <strong>{assets.length}</strong> registered systems
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1 flex-wrap gap-y-1">
            <span className="text-xs text-slate-500 mr-1 font-medium">Criticality:</span>
            {['all', 'Critical', 'High', 'Medium', 'Low'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCriticalityFilter(c)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  criticalityFilter === c ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
            <span className="text-xs text-slate-500 mr-1 font-medium">Ward:</span>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-md px-2 py-1 focus:outline-hidden"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by asset, ID, or room..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssets.map(asset => {
          const assetControls = controls.filter(c => c.asset_id === asset.asset_id);
          const effectiveControls = assetControls.filter(c => c.rating === 'Effective').length;

          return (
            <div
              key={asset.asset_id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        asset.criticality === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : asset.criticality === 'High'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {asset.criticality}
                      </span>
                      <span className="font-mono text-xs text-slate-500 font-semibold">{asset.asset_id}</span>
                      <span className="text-xs text-slate-400">&bull; {asset.asset_type}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{asset.asset_name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDrillDown(asset.asset_id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 transition shadow-xs"
                    title="Audit Evidence Drill-down"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 italic mt-2 bg-slate-50 border border-slate-100 p-2 rounded">
                  &ldquo;{asset.business_function}&rdquo;
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dept: <strong className="text-slate-800">{asset.department}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Loc: <span className="text-slate-800">{asset.location}</span></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Owner: <span className="text-slate-700">{asset.owner}</span></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Controls: <strong className="text-slate-800">{assetControls.length}</strong> ({effectiveControls} effective)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Updated: {asset.last_updated}</span>
                <button
                  type="button"
                  onClick={() => onDrillDown(asset.asset_id)}
                  className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
                >
                  <span>View Evidence Chain</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
