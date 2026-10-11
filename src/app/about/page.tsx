import { Metadata } from "next";
import Link from "next/link";
import { 
  Target, 
  ArrowRight, 
  Code2, 
  Terminal, 
  Sparkles,
  Lock,
  Server
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | AriseStudio",
  description: "Learn about AriseStudio - our engineering culture, architectural standards, leadership philosophy, and commitment to building resilient automation systems.",
};

const principles = [
  {
    icon: Code2,
    title: "Zero Blind Commits & Deterministic Architecture",
    desc: "Every pull request undergoes static analysis, automated unit/integration suites, and mandatory peer review from a Principal Architect. We don't deploy fragile hotfixes or untested glue code to production."
  },
  {
    icon: Target,
    title: "Measurable Economic ROI",
    desc: "We consider software an engineering asset, not an experiment. Every workflow we automate and every platform we build is evaluated by concrete business metrics: payroll hours saved, order throughput multiplied, and eliminated SaaS seat licenses."
  },
  {
    icon: Lock,
    title: "Data Sovereignty & Code IP Ownership",
    desc: "You own 100% of your source code, deployment scripts, schema definitions, and private keys from day one. Your sensitive commercial data stays securely on your own cloud VPC, never locked into proprietary vendor silos."
  },
  {
    icon: Server,
    title: "Contractual Incident SLAs",
    desc: "When high-volume campaigns or month-end billing cycles run, automated bots are not enough. Our dedicated on-call systems engineers are bound by contract to respond within 15 minutes of any priority escalation."
  }
];

const teamPods = [
  {
    pod: "Core Systems & ERP Pod",
    focus: "Enterprise Resource Planning, Custom CRM, High-Throughput Relational Databases",
    stack: ["TypeScript", "NestJS", "PostgreSQL", "TimescaleDB", "GraphQL"]
  },
  {
    pod: "Commerce & Automation Pod",
    focus: "Multi-Channel Inventory Engines, Courier APIs, Automated Invoicing, RPA",
    stack: ["Next.js", "Python", "Temporal.io", "Shopify API", "Redis Mutex"]
  },
  {
    pod: "Cloud Reliability & SRE Desk",
    focus: "24/7 Monitoring, Multi-Region Failover, DDoS Mitigation, Kubernetes",
    stack: ["AWS", "Kubernetes", "Terraform", "Prometheus", "Cloudflare"]
  }
];

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 relative bg-[#09101d] overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/25 via-[#0a814f]/15 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-[#004157]/20 blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-300 bg-[#004157]/40 border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Engineering Heritage & Culture
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mt-4 tracking-tight">
          We Build the Software <br className="hidden sm:inline" />
          <span className="gradient-text-teal-emerald">Your Business Actually Owns.</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          AriseStudio was founded with a straightforward thesis: growing enterprises shouldn&apos;t be held hostage between manual spreadsheet chaos and extortionate per-user SaaS license fees. We design, deploy, and safeguard bespoke operational engines.
        </p>
      </div>

      {/* Story & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="rounded-3xl bg-[#09101d] border border-white/[0.08] p-8 sm:p-14 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                Who We Are & Why We Exist
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Pragmatic Software Engineering for Complex Realities
              </h2>
              <p className="text-slate-300 leading-relaxed text-base">
                We observed that while multibillion-dollar conglomerates have in-house software arms, mid-market enterprises frequently struggle with fragmented SaaS tools that don&apos;t talk to one another, leaving operators to re-enter data by hand.
              </p>
              <p className="text-slate-300 leading-relaxed text-base">
                AriseStudio bridges that gap. We assemble senior engineering pods that step into your operational bottlenecks, architect resilient automated pipelines, build custom ERPs tailored to your exact hierarchy, and protect uptime 24/7/365.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#004157]/50 border border-emerald-500/30 text-emerald-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Founded in Dhaka, Operating Globally</h4>
                  <p className="text-xs text-slate-400">Partnering with fast-scaling enterprises across North America, Europe, the Middle East, and South Asia.</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid with Brand Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-emerald-500/40 transition-colors">
                <p className="text-4xl font-extrabold text-emerald-400 font-mono">100%</p>
                <p className="text-sm font-semibold text-white mt-2">Code & IP Ownership</p>
                <p className="text-xs text-slate-400 mt-1">Full source code rights, schema migrations, and database sovereignty.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-emerald-500/40 transition-colors">
                <p className="text-4xl font-extrabold text-sky-400 font-mono">24/7</p>
                <p className="text-sm font-semibold text-white mt-2">Engineers On Call</p>
                <p className="text-xs text-slate-400 mt-1">Active telemetries, rapid triage, and synthetic edge probes.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-emerald-500/40 transition-colors">
                <p className="text-4xl font-extrabold text-teal-300 font-mono">0 min</p>
                <p className="text-sm font-semibold text-white mt-2">Unplanned Downtime</p>
                <p className="text-xs text-slate-400 mt-1">Zero-downtime rolling deploys and automatic failover drills.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-emerald-500/40 transition-colors">
                <p className="text-4xl font-extrabold text-emerald-400 font-mono">&lt; 15 min</p>
                <p className="text-sm font-semibold text-white mt-2">Priority SLA Response</p>
                <p className="text-xs text-slate-400 mt-1">Contractual SLA guarantee for mission-critical production alerts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Engineering Principles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-300 bg-[#004157]/40 border border-emerald-500/30">
            Our Architectural Tenets
          </span>
          <h2 className="text-3xl font-bold text-white mt-3">The Principles We Code By</h2>
          <p className="text-slate-400 mt-2 text-sm">
            Standards crafted to provide predictability, auditability, and long-term security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((pr, idx) => {
            const Icon = pr.icon;
            return (
              <div key={idx} className="p-8 rounded-2xl bg-[#09101d] border border-white/[0.08] hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#004157]/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{pr.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{pr.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engineering Pod Structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="rounded-3xl bg-slate-900/50 border border-white/[0.08] p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
              Studio Structure
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Cross-Functional Engineering Pods
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              You collaborate directly with dedicated systems engineers and technical leads—never account managers or outsourced junior subcontractors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamPods.map((pod, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#09101d] border border-white/[0.08] space-y-4">
                <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  Pod 0{idx + 1}
                </div>
                <h4 className="text-lg font-bold text-white">{pod.pod}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{pod.focus}</p>
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-800">
                  {pod.stack.map((st) => (
                    <span key={st} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#004157]/40 text-emerald-300 border border-emerald-500/20">
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-[#004157]/40 via-[#09101d] to-[#0a814f]/30 border border-emerald-500/30 p-10 sm:p-14 shadow-2xl">
          <h2 className="text-3xl font-bold text-white">Let&apos;s Review Your Technical Roadmap</h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Book an introductory technical architecture audit with our lead systems engineer. We assess your workflow bottlenecks and provide a concrete action plan within 48 hours.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all text-sm shadow-xl shadow-emerald-500/20"
            >
              Book an Architecture Session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
