import React from 'react';
import { Radio, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { FreshnessReport, SourceFreshness } from '../../types';

interface DataFreshnessViewProps {
  freshness: FreshnessReport | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DataFreshnessView: React.FC<DataFreshnessViewProps> = ({
  freshness,
  onRefresh,
  isRefreshing
}) => {
  if (!freshness) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Validating hospital data feed health...</span>
      </div>
    );
  }

  const confidence = freshness.overall_confidence;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FRESH':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>FRESH</span>
          </span>
        );
      case 'STALE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>STALE</span>
          </span>
        );
      case 'DELAYED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>DELAYED</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>MISSING</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const getSourceClinicalContext = (key: string) => {
    switch (key) {
      case 'control_telemetry':
        return 'Streaming syslog heartbeats from microsegmentation routers, medical NAC appliances, and EDR agents.';
      case 'assets':
        return 'Clinical engineering CMMS inventory defining medical device criticality, room locations, and ownership.';
      case 'vulnerabilities':
        return 'Continuous vulnerability scanner outputs capturing CVEs and CVSS vectors across clinical subnets.';
      case 'incidents':
        return 'SOC SIEM alert ingestion containing real-time intrusion alarms, unauthorized access, and containment states.';
      case 'remediation':
        return 'Biomedical IT ticketing records tracking manufacturer patch application and validation.';
      case 'controls':
        return 'Hospital security governance catalog specifying implemented technical controls and audit schedules.';
      default:
        return 'Standard hospital SOC telemetry source.';
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Data Quality &amp; Telemetry Health Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Validating input reliability across all 6 data pipelines to guarantee trustworthy, uncompromised risk calculations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-2 ${
            confidence === 'HIGH'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : confidence === 'MEDIUM'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Overall Confidence: {confidence}</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Poll Health</span>
          </button>
        </div>
      </div>

      {/* Confidence Impact Banner */}
      <div className="bg-blue-50/40 border border-blue-200 p-4 rounded-xl text-xs text-slate-700 space-y-2 shadow-xs">
        <div className="flex items-center space-x-2 text-slate-900 font-bold">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>Impact of Data Freshness on Executive Risk Calculations</span>
        </div>
        <p className="leading-relaxed">
          When telemetry sources lag by more than 48 hours (or become missing), risk scores cannot be assumed to reflect immediate real-world clinical security conditions. The system assigns an explicit uncertainty margin (e.g. &plusmn;5.5 risk points) and surfaces a high-priority operational recommendation to refresh the stalled pipeline before executive decisions are finalized.
        </p>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(freshness.sources).map(([key, src]: [string, SourceFreshness]) => (
          <div
            key={key}
            className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 capitalize">
                    {key.replace(/_/g, ' ')} Feed
                  </h3>
                  <span className="font-mono text-xs text-slate-400 font-medium">
                    {src.source}
                  </span>
                </div>
                {getStatusBadge(src.status)}
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {getSourceClinicalContext(key)}
              </p>

              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="text-slate-800 font-medium">
                  {src.freshness_message}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Last Updated: {src.last_updated ? new Date(src.last_updated).toUTCString() : 'N/A (No timestamps found)'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Records: <strong className="text-slate-900">{src.total_rows}</strong></span>
              <span>Valid Parsed: <strong className="text-slate-900">{src.valid_rows}</strong></span>
              <span className={`font-semibold ${src.exists ? 'text-emerald-700' : 'text-rose-700'}`}>
                {src.exists ? 'Source Online' : 'Source Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
