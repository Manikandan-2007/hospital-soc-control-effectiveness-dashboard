import React, { useState } from 'react';
import {
  TrendingDown,
  Shield,
  Layers,
  ArrowUpRight,
  Calculator,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { RiskSummary, AssetRiskProfile } from '../../types';

interface RiskAnalysisViewProps {
  riskSummary: RiskSummary | null;
  onDrillDown: (assetId: string) => void;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  riskSummary,
  onDrillDown
}) => {
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');

  if (!riskSummary) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Computing clinical risk distributions...</span>
      </div>
    );
  }

  const breakdownData = riskSummary.criticality_breakdown.map(b => ({
    criticality: b.criticality,
    count: b.asset_count,
    baseline: b.baseline_risk,
    current: b.current_risk,
    reduction: b.risk_reduction_pct
  }));

  const filteredAssets = riskSummary.asset_risk_profiles.filter(a => {
    if (selectedCriticality !== 'all' && a.criticality !== selectedCriticality) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Title & Methodology */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Hospital Cyber Risk Quantification &amp; Modeling
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Transparent, non-black-box risk calculation integrating asset clinical criticality, CVSS scores, incident impact, control mitigation, and verified remediation.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center space-x-3 shrink-0">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Overall Hospital Risk</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-lg font-black text-amber-700">{riskSummary.hospital_baseline_risk}</span>
                <span className="text-slate-400 text-xs">&rarr;</span>
                <span className="text-lg font-black text-emerald-600">{riskSummary.hospital_current_risk}</span>
                <span className="text-xs font-bold text-emerald-700">(-{riskSummary.risk_reduction_pct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Formula Display Box */}
      <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-4 text-xs text-slate-700 space-y-2">
        <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
          <Calculator className="w-3.5 h-3.5" />
          <span>Transparent Mathematical Risk Model</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed shadow-xs">
            <span className="text-amber-700 font-bold block mb-1">Baseline Risk (Inherent):</span>
            <code>Baseline = min(100, (Criticality_Weight &times; 35) + (CVSS_Inherent &times; 0.45) + (Incident_Inherent &times; 0.20))</code>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed shadow-xs">
            <span className="text-emerald-700 font-bold block mb-1">Current Risk (Residual):</span>
            <code>Current = Baseline &times; (1 - Control_Mitigation_Ratio) &times; (1 - Remediation_Ratio) + Active_Incident_Penalty</code>
          </div>
        </div>
      </div>

      {/* Normalized Scale Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="p-3 bg-white border border-rose-200 rounded-xl text-center shadow-xs">
          <div className="text-rose-600 font-black text-sm">81 - 100</div>
          <div className="text-[11px] font-bold text-rose-700 uppercase">Critical Risk</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Direct patient harm potential</p>
        </div>
        <div className="p-3 bg-white border border-orange-200 rounded-xl text-center shadow-xs">
          <div className="text-orange-600 font-black text-sm">61 - 80</div>
          <div className="text-[11px] font-bold text-orange-700 uppercase">High Risk</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Clinical workflow disruption</p>
        </div>
        <div className="p-3 bg-white border border-amber-200 rounded-xl text-center shadow-xs">
          <div className="text-amber-600 font-black text-sm">41 - 60</div>
          <div className="text-[11px] font-bold text-amber-700 uppercase">Moderate Risk</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Protected by perimeter controls</p>
        </div>
        <div className="p-3 bg-white border border-blue-200 rounded-xl text-center shadow-xs">
          <div className="text-blue-600 font-black text-sm">21 - 40</div>
          <div className="text-[11px] font-bold text-blue-700 uppercase">Low Risk</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Target operational envelope</p>
        </div>
        <div className="p-3 bg-white border border-emerald-200 rounded-xl text-center shadow-xs">
          <div className="text-emerald-600 font-black text-sm">0 - 20</div>
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Very Low Risk</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Isolated / non-critical tier</p>
        </div>
      </div>

      {/* Criticality Breakdown Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Risk Reduction by Asset Criticality Tier
            </h3>
            <p className="text-xs text-slate-500">
              Comparing Baseline vs Current Residual Risk across clinical priority classes
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="criticality" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(val: any, name: any) => [`${val} / 100`, name === 'baseline' ? 'Baseline Risk' : 'Current Residual Risk']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="baseline" name="Baseline Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name="Current Risk" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Risk Ranking Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Asset Risk Rankings</h3>
            <p className="text-xs text-slate-500">
              Ranked in descending order of current residual risk
            </p>
          </div>
          <div className="flex space-x-1 flex-wrap gap-y-1">
            {['all', 'Critical', 'High', 'Medium', 'Low'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCriticality(c)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  selectedCriticality === c
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {c === 'all' ? 'All Tiers' : c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Asset ID / Name</th>
                <th className="p-3.5">Criticality</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Baseline Risk</th>
                <th className="p-3.5">Current Risk</th>
                <th className="p-3.5">Reduction %</th>
                <th className="p-3.5">Controls / Efficacy</th>
                <th className="p-3.5 text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAssets.map(a => (
                <tr key={a.asset_id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 text-xs">{a.asset_name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{a.asset_id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.criticality === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : a.criticality === 'High'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {a.criticality}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">{a.department}</td>
                  <td className="p-3.5 font-bold text-slate-500">{a.baseline_risk}</td>
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-sm text-slate-900">{a.current_risk}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        a.risk_tier === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        a.risk_tier === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        a.risk_tier === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {a.risk_tier}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-600">
                    -{a.reduction_pct}%
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {a.control_count} controls ({a.avg_control_effectiveness}% eff.)
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDrillDown(a.asset_id)}
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
