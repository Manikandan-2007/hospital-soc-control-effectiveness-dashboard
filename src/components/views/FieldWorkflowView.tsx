import React, { useState } from 'react';
import {
  GitFork,
  Radio,
  Shield,
  Activity,
  Calculator,
  FileCheck,
  Wrench,
  CheckCircle,
  TrendingDown,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

export const FieldWorkflowView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      name: 'SOC Event Detection',
      icon: Radio,
      actor: 'SOC SIEM & Syslog Sensors',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      summary: 'Raw telemetry streams arrive from medical NAC routers, firewalls, and EDR agents.',
      exampleScenario: 'At 04:12 UTC, a medical gateway router flags 15 unauthorized SSH connection attempts originating from an untrusted guest subnet targeting the ICU Central Monitoring Station.',
      clinicalOutcome: 'Event is parsed, timestamped, deduplicated, and matched against registered medical asset AST-ICU-001.'
    },
    {
      step: 2,
      name: 'Control Enforcement Evaluation',
      icon: Shield,
      actor: 'Control Effectiveness Engine',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      summary: 'Assigned controls (VLAN Segmentation, PAM, EDR) are evaluated for active containment vs failure.',
      exampleScenario: 'VLAN Microsegmentation control CTL-SEG-001 triggers an automated drop rule, generating a "control_success" telemetry heartbeat.',
      clinicalOutcome: 'Control effectiveness score remains at 94.5%, confirming that network barriers prevented any direct access to patient telemetry feeds.'
    },
    {
      step: 3,
      name: 'Clinical Business Impact Assessment',
      icon: Activity,
      actor: 'Clinical Engineering & Risk Specialist',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      summary: 'Technical findings are mapped to patient safety risk, department operations, and regulatory penalties.',
      exampleScenario: 'Although the intrusion was dropped, asset AST-ICU-001 has an open CVE-2024-38077 (CVSS 9.8). If exploited, patient vital monitoring across 16 ICU beds could be paralyzed.',
      clinicalOutcome: 'Identified as a critical business risk due to life-safety reliance, overriding standard low-priority queueing.'
    },
    {
      step: 4,
      name: 'Quantitative Risk Calculation',
      icon: Calculator,
      actor: 'Risk Engine',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      summary: 'Normalized 0-100 baseline and residual risk scores are recalculated based on asset criticality, CVSS, and active mitigations.',
      exampleScenario: 'Asset baseline inherent risk is calculated at 86.4 (Critical). Mitigated residual risk is computed at 34.2 (Low-Moderate) due to active perimeter firewall rules.',
      clinicalOutcome: 'Hospital executive dashboard reflects current residual risk of 32.8, with -46.1% risk reduction achieved.'
    },
    {
      step: 5,
      name: 'Actionable Recommendation',
      icon: FileCheck,
      actor: 'Recommendation Engine',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      summary: 'Translates findings into a plain-language executive directive with what, why, and next steps.',
      exampleScenario: 'Generates REC-001: "Expedite Critical Remediation on ICU Central Monitoring Station", recommending a scheduled clinical maintenance window.',
      clinicalOutcome: 'Hospital COO and Clinical Director receive a clear operational request without dense cybersecurity jargon.'
    },
    {
      step: 6,
      name: 'Remediation & Validation',
      icon: Wrench,
      actor: 'Biomedical IT & OEM Vendor',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      summary: 'Manufacturer-validated firmware patch is deployed during non-emergency maintenance.',
      exampleScenario: 'Biomedical IT tests the patch on a staging monitor, deploys it to the ICU Central Station, and verifies ECG and SpO2 alarm propagation.',
      clinicalOutcome: 'Remediation status updated to "Completed", ticket REM-001 filed.'
    },
    {
      step: 7,
      name: 'Clinical Verification',
      icon: CheckCircle,
      actor: 'Clinical Engineering Lead',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      summary: 'Formal verification confirms that patient safety and clinical operations remain uncompromised.',
      exampleScenario: 'Lead Biomedical Engineer signs off: "Verified Effective. Alarm routing to nurse stations and mobile alerts tested 100% nominal."',
      clinicalOutcome: 'Verification status advances from "Pending" to "Verified Effective".'
    },
    {
      step: 8,
      name: 'Risk Reduction Recalculation',
      icon: TrendingDown,
      actor: 'SOC Governance Engine',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      summary: 'Verified remediation is credited towards residual risk reduction, locking in permanent clinical risk mitigation.',
      exampleScenario: 'Asset risk decreases from 34.2 to 21.0. Overall hospital residual risk drops toward the target of 25.0.',
      clinicalOutcome: 'Executive overview displays measurable attribution: 28.1 points of risk reduction provably achieved by the completed control!'
    }
  ];

  const current = steps.find(s => s.step === activeStep) || steps[0];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Field Workflow: End-to-End Clinical Cybersecurity Lifecycle
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Interactive operational lifecycle demonstrating how raw SOC telemetry flows into executive business risk reduction.
        </p>
      </div>

      {/* Horizontal Workflow Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 overflow-x-auto shadow-xs">
        <div className="flex items-center min-w-[760px] justify-between relative">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isSelected = s.step === activeStep;

            return (
              <React.Fragment key={s.step}>
                <button
                  type="button"
                  onClick={() => setActiveStep(s.step)}
                  className={`flex flex-col items-center space-y-1.5 p-2 rounded-lg transition text-center shrink-0 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold truncate max-w-[85px]">
                    {s.step}. {s.name.split(' ')[0]}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-4 h-0.5 bg-slate-200 shrink-0 mx-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Step Deep-Dive Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                Stage {current.step} of 8
              </span>
              <span className="text-xs text-slate-500">Responsible Role: <strong className="text-slate-900">{current.actor}</strong></span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">{current.name}</h3>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => setActiveStep(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-xs"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={activeStep === 8}
              onClick={() => setActiveStep(p => Math.min(8, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold transition shadow-xs"
            >
              Next Step
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-700 font-medium">
          {current.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-1.5">
            <span className="text-amber-800 font-bold uppercase tracking-wider block text-[10px]">
              Live Hospital Scenario Walkthrough
            </span>
            <p className="text-slate-700 leading-relaxed">
              {current.exampleScenario}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
            <span className="text-emerald-800 font-bold uppercase tracking-wider block text-[10px]">
              Clinical &amp; Risk Governance Outcome
            </span>
            <p className="text-slate-700 leading-relaxed">
              {current.clinicalOutcome}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
