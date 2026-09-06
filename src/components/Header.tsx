import React from 'react';
import { Shield, Activity, RefreshCw, AlertTriangle, UserCheck } from 'lucide-react';
import { Role, FreshnessReport } from '../types';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  freshness: FreshnessReport | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeIncidentsCount: number;
  openCriticalVulnsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  freshness,
  onRefresh,
  isRefreshing,
  activeIncidentsCount,
  openCriticalVulnsCount
}) => {
  const confidence = freshness?.overall_confidence || 'HIGH';
  const confidenceColor =
    confidence === 'HIGH'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : confidence === 'MEDIUM'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <header className="shrink-0 h-16 bg-white text-slate-800 border-b border-slate-200 shadow-xs z-30">
      <div className="w-full px-4 sm:px-6 flex items-center justify-between h-full gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 truncate">
                Hospital SOC Dashboard
              </span>
              <span className="hidden xl:inline text-xs text-slate-400 font-medium whitespace-nowrap">| Control Effectiveness &amp; Risk</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0 whitespace-nowrap">
                Phase 1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden md:block">
              Translating Clinical Cybersecurity Controls into Measurable Business Risk Reduction
            </p>
          </div>
        </div>

        {/* Right Actions: Role Selector, Freshness Badge, Refresh */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Live alerts pill if critical issues exist */}
          {(activeIncidentsCount > 0 || openCriticalVulnsCount > 0) && (
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium whitespace-nowrap shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
              <span>
                {activeIncidentsCount} incident{activeIncidentsCount !== 1 ? 's' : ''} &bull; {openCriticalVulnsCount} overdue vuln{openCriticalVulnsCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Freshness Indicator */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 hidden 2xl:inline">Telemetry:</span>
            <div className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center space-x-1.5 whitespace-nowrap shadow-xs ${confidenceColor}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${confidence === 'HIGH' ? 'bg-emerald-500' : confidence === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              <span>{confidence} CONFIDENCE</span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0 shadow-xs">
            <span className="text-[11px] text-slate-500 px-1.5 items-center space-x-1 hidden lg:flex font-medium">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Role:</span>
            </span>
            <button
              type="button"
              onClick={() => onRoleChange('management')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentRole === 'management'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Non-technical clinical risk & executive summary"
            >
              Management
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('soc_analyst')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentRole === 'soc_analyst'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Technical telemetry, incidents & vulnerability queues"
            >
              SOC Analyst
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('security_manager')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentRole === 'security_manager'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Control efficacy, trends & remediation performance"
            >
              Security Manager
            </button>
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-xs shrink-0"
            title="Refresh all SOC data feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
