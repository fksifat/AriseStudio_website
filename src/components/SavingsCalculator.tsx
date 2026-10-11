"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";

export default function SavingsCalculator() {
  const [teamSize, setTeamSize] = useState<number>(4);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(12);
  const [hourlyRate, setHourlyRate] = useState<number>(18);

  // Calculations
  const weeklyHoursLost = teamSize * hoursPerWeek;
  const annualHoursLost = weeklyHoursLost * 50; // 50 working weeks
  const annualPayrollWasted = annualHoursLost * hourlyRate;
  
  // Automation typically eliminates 80% to 90% of manual entry
  const reclaimedHours = Math.round(annualHoursLost * 0.85);
  const annualSavings = Math.round(annualPayrollWasted * 0.85);

  return (
    <div className="rounded-3xl bg-[#09101d] border border-white/[0.08] shadow-2xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Automation ROI Estimator</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calculate How Much Manual Friction Costs Your Business
          </h3>

          <p className="text-slate-300 text-sm leading-relaxed">
            Every hour your operators spend copying data between spreadsheets, re-entering invoices, or chasing manual approvals is capital drained from growth. Slide the parameters below to see your potential savings.
          </p>

          <div className="space-y-6 pt-2">
            {/* Slider 1: Team Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-300">Staff performing manual repetitive workflows:</span>
                <span className="font-mono text-emerald-400 font-bold text-base px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {teamSize} {teamSize === 1 ? "person" : "people"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>1 operator</span>
                <span>12 team</span>
                <span>25+ enterprise</span>
              </div>
            </div>

            {/* Slider 2: Hours per week */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-300">Hours spent on manual work per person/week:</span>
                <span className="font-mono text-emerald-400 font-bold text-base px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {hoursPerWeek} hrs / week
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>4 hrs (minimal)</span>
                <span>15 hrs (typical)</span>
                <span>30 hrs (severe bottleneck)</span>
              </div>
            </div>

            {/* Slider 3: Blended Hourly Cost */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-300">Estimated blended hourly cost:</span>
                <span className="font-mono text-emerald-400 font-bold text-base px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  ${hourlyRate} / hour
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="60"
                step="2"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>$8/hr</span>
                <span>$30/hr</span>
                <span>$60/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calculated Yield Card */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-[#030712] border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Projected Annual Impact
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                85% Automation Rate
              </span>
            </div>

            {/* Big Metrics */}
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Recoverable Team Hours:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {reclaimedHours.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-emerald-400">hours / year</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Direct Capital Reclaimed:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-emerald-400 font-mono">
                    ${annualSavings.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">/ year in payroll capacity</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Typical AriseStudio sprint payback: <strong>Under 45 days</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0 manual transcription errors & invoice mismatches</span>
              </div>
            </div>

            <Link
              href={`/contact?service=business-automation&message=We%20currently%20have%20${teamSize}%20team%20members%20spending%20approximately%20${hoursPerWeek}%20hours%20per%20week%20on%20manual%20workflows.`}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all text-sm shadow-lg shadow-emerald-500/25"
            >
              Modernize This Workflow
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
