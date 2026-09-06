import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  TrendingDown,
  Server,
  Bug,
  AlertOctagon,
  Wrench,
  Radio,
  FileSearch,
  FlaskConical,
  GitFork
} from 'lucide-react';
import { Role } from '../types';

export type PageId =
  | 'overview'
  | 'controls'
  | 'risks'
  | 'assets'
  | 'vulnerabilities'
  | 'incidents'
  | 'remediation'
  | 'freshness'
  | 'evidence'
  | 'failure_testing'
  | 'workflow';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  currentRole: Role;
  counts?: {
    activeIncidents?: number;
    openCriticalVulns?: number;
    staleFeeds?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  currentRole,
  counts
}) => {
  const navItems = [
    {
      id: 'overview' as PageId,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      roles: ['management', 'soc_analyst', 'security_manager']
    },
    {
      id: 'controls' as PageId,
      label: 'Control Effectiveness',
      icon: ShieldCheck,
      roles: ['management', 'security_manager']
    },
    {
      id: 'risks' as PageId,
      label: 'Risk Analysis',
      icon: TrendingDown,
      roles: ['management', 'security_manager']
    },
    {
      id: 'assets' as PageId,
      label: 'Medical Assets',
      icon: Server,
      roles: ['management', 'soc_analyst', 'security_manager']
    },
    {
      id: 'vulnerabilities' as PageId,
      label: 'Vulnerabilities',
      icon: Bug,
      badge: counts?.openCriticalVulns,
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
      roles: ['soc_analyst', 'security_manager']
    },
    {
      id: 'incidents' as PageId,
      label: 'SOC Incidents',
      icon: AlertOctagon,
      badge: counts?.activeIncidents,
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
      roles: ['soc_analyst', 'security_manager']
    },
    {
      id: 'remediation' as PageId,
      label: 'Remediation',
      icon: Wrench,
      roles: ['soc_analyst', 'security_manager']
    },
    {
      id: 'freshness' as PageId,
      label: 'Data Freshness',
      icon: Radio,
      badge: counts?.staleFeeds ? `${counts.staleFeeds} Stale` : undefined,
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
      roles: ['management', 'soc_analyst', 'security_manager']
    },
    {
      id: 'evidence' as PageId,
      label: 'Evidence Drill-down',
      icon: FileSearch,
      roles: ['management', 'soc_analyst', 'security_manager']
    },
    {
      id: 'failure_testing' as PageId,
      label: 'Failure Case Testing',
      icon: FlaskConical,
      roles: ['soc_analyst', 'security_manager']
    },
    {
      id: 'workflow' as PageId,
      label: 'Field Workflow',
      icon: GitFork,
      roles: ['management', 'soc_analyst', 'security_manager']
    }
  ];

  return (
    <aside className="w-60 sm:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full text-slate-700">
      {/* Role Banner inside Sidebar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
            {currentRole === 'management'
              ? 'Management View'
              : currentRole === 'soc_analyst'
              ? 'SOC Telemetry'
              : 'Security Governance'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          {currentRole === 'management'
            ? 'Clinical risk & business reduction translation'
            : currentRole === 'soc_analyst'
            ? 'Medical device telemetry & alert triage'
            : 'Control efficacy tracking & policy compliance'}
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentPage === item.id;
          const isRoleTarget = item.roles.includes(currentRole);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${!isRoleTarget ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate text-left">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge !== 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                    item.badgeColor || 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* High-density Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 shrink-0 shadow-2xs">
            {currentRole === 'management' ? 'HM' : currentRole === 'soc_analyst' ? 'SA' : 'SM'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {currentRole === 'management'
                ? 'Clinical Dir. Office'
                : currentRole === 'soc_analyst'
                ? 'Tier-2 SOC Analyst'
                : 'CISO / Risk Office'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
              Target Risk: 25.0 &bull; ISO 27001
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
