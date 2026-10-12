import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShoppingCart, 
  Database, 
  Layers,
  Headphones, 
  Sparkles,
  Quote
} from "lucide-react";
import { servicesData, testimonialsData, engagementModels } from "@/data/companyData";
import ArchitectureSimulator from "@/components/ArchitectureSimulator";
import SavingsCalculator from "@/components/SavingsCalculator";
import TechStackIcons from "@/components/TechStackIcons";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-[#09101d]">
      {/* Background Gradients & Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/25 via-[#0a814f]/15 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[850px] left-0 w-[550px] h-[550px] bg-[#004157]/20 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1600px] right-0 w-[500px] h-[500px] bg-[#0a814f]/15 blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Live Studio Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-[#004157]/30 text-emerald-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dhaka Studio · 40+ Production Deployments · 24/7 SLA Active</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Automate the Repetitive. <br />
              <span className="gradient-text-teal-emerald">Engineer for Exponential Scale.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              AriseStudio builds high-throughput <strong>E-Commerce Automation</strong>, bespoke <strong>ERP & CRM Systems</strong>, robotic process pipelines, and round-the-clock <strong>24/7 Managed IT Support</strong>. We eliminate manual bottlenecks so teams focus on high-margin growth.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-xl shadow-emerald-500/25 hover:-translate-y-0.5 text-base"
              >
                Schedule an Architecture Audit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-200 bg-[#004157]/40 hover:bg-[#004157]/70 border border-emerald-500/30 transition-all text-base hover:text-white"
              >
                Explore Modules & Stack
              </Link>
            </div>

            {/* Executive SLA & Trust Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 rounded-2xl bg-[#004157]/20 border border-white/[0.08] backdrop-blur-md">
              <div className="text-center p-3 border-r border-slate-800/80 last:border-none">
                <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">99.98%</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Guaranteed SLA Uptime</p>
              </div>
              <div className="text-center p-3 md:border-r border-slate-800/80 last:border-none">
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">&lt; 15 min</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Critical Escalation Response</p>
              </div>
              <div className="text-center p-3 border-r border-slate-800/80 last:border-none">
                <p className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-mono">100%</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Client Code & IP Ownership</p>
              </div>
              <div className="text-center p-3">
                <p className="text-3xl sm:text-4xl font-extrabold text-teal-300 font-mono">0</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Per-User SaaS License Tax</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Venture / Product Incubator: AriseSell */}
      <section id="products" className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#004157]/30 via-[#09101d] to-[#0a814f]/25 border border-emerald-500/30 shadow-2xl p-8 sm:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Flagship In-House Product</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Meet <span className="gradient-text-teal-emerald">AriseSell</span> — Unified Multi-Channel E-Commerce Automation
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  Engineered and incubated directly by AriseStudio, <strong>AriseSell</strong> bridges online storefronts, warehouse inventories, parcel couriers, and accounting ledgers into one autonomous engine. No more copy-pasting tracking numbers or inventory overselling.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time Multi-Warehouse Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Courier API Auto-Consignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Omnichannel POS & Web Harmony</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Automated Return & RMA Workflows</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/contact?service=arisesell"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors text-sm shadow-lg shadow-emerald-500/20"
                  >
                    Request AriseSell Demo & Pilot
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs font-mono text-slate-400">
                    Deployed across 14+ enterprise retail stores
                  </span>
                </div>
              </div>

              {/* Product Card Visual */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="p-8 rounded-3xl bg-[#0a0f1d] border border-emerald-500/30 shadow-2xl flex flex-col items-center text-center relative max-w-sm w-full">
                  <div className="w-36 h-36 relative mb-4 p-3 bg-slate-900/90 rounded-2xl border border-emerald-500/25 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <Image
                      src="/brand/arisesell-icon.svg"
                      alt="AriseSell Icon"
                      width={130}
                      height={130}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  
                  {/* Cropped White Brand Logo Banner */}
                  <div className="w-full px-4 py-2 mt-1">
                    <Image
                      src="/brand/arisesell-logo-white-cropped.png"
                      alt="AriseSell Official Logo"
                      width={220}
                      height={50}
                      className="w-auto h-9 mx-auto object-contain"
                    />
                  </div>

                  <p className="text-xs text-emerald-400 font-mono uppercase tracking-wider mt-2">
                    Incubated by AriseStudio
                  </p>
                  <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>API SYNC STATUS:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      100% OPERATIONAL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Architecture Blueprint Simulator */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400 bg-[#004157]/40 px-3 py-1 rounded-full border border-emerald-500/30">
              Interactive System Topology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
              Under the Hood: High-Resilience Engineering
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
              Explore how AriseStudio orchestrates zero-loss data pipelines, distributed mutex locks, and automated courier APIs. Toggle tabs below to inspect execution flows and live payloads.
            </p>
          </div>

          <ArchitectureSimulator />
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-20 relative" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-[#004157]/40 px-3 py-1 rounded-full border border-emerald-500/30">
                Engineering Modules
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                Architectural Capabilities Designed for Reliability
              </h2>
              <p className="text-slate-400 mt-3 text-base">
                Whether you need to eliminate spreadsheet copy-pasting, develop a custom company-wide ERP, or secure your infrastructure 24/7, our pods deliver production-grade code.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View detailed service specifications <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {servicesData.map((service) => {
              let IconComponent = ShoppingCart;
              if (service.id === "erp-crm") IconComponent = Database;
              if (service.id === "business-automation") IconComponent = Layers;
              if (service.id === "it-support") IconComponent = Headphones;

              return (
                <div
                  key={service.id}
                  className="rounded-3xl bg-[#004157]/15 border border-white/[0.08] p-8 hover:border-emerald-500/40 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#004157]/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-all">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                      {service.fullDesc}
                    </p>

                    <div className="mt-6 space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                        Key Capabilities & Deliverables:
                      </p>
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {service.techStack.slice(0, 4).map((tech) => (
                        <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-[#004157]/30 text-emerald-300 font-mono border border-emerald-500/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/services#${service.id}`}
                      className="text-xs font-semibold text-emerald-400 hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-all"
                    >
                      Specifications <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Savings & ROI Estimator */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SavingsCalculator />
        </div>
      </section>

      {/* Verified Client Testimonials Section */}
      <section className="py-24 bg-[#070b14] border-y border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-[#004157]/40 px-3 py-1 rounded-full border border-emerald-500/30">
              Verified Client Endorsements
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
              Real Impact Reported by Enterprise Leaders
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Here is what founders, COOs, and engineering directors say about partnering with our technical teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((test) => (
              <div
                key={test.id}
                className="rounded-3xl bg-[#09101d] border border-white/[0.08] p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Quote className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {test.impactMetric}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{test.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#004157] border border-emerald-500/30 flex items-center justify-center font-bold text-white text-sm">
                    {test.author.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{test.author}</h4>
                    <p className="text-xs text-slate-400">{test.role}, <span className="text-slate-300">{test.company}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models & Delivery Process */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-[#004157]/40 px-3 py-1 rounded-full border border-emerald-500/30">
              Clear Engagement Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              How We Deliver: Predictable, Transparent, Accountable
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              No bloated contracts or ambiguous hours. Choose the engagement structure that aligns with your engineering timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {engagementModels.map((model, idx) => (
              <div 
                key={idx}
                className={`p-8 rounded-3xl border transition-all flex flex-col justify-between ${
                  idx === 1 
                    ? "bg-[#004157]/25 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 relative"
                    : "bg-[#09101d] border-white/[0.08]"
                }`}
              >
                <div>
                  {idx === 1 && (
                    <span className="inline-block mb-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px] uppercase tracking-wider">
                      Most Popular For Scaling
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-white">{model.title}</h3>
                  <p className="text-xs font-mono text-emerald-400 mt-1 font-semibold">{model.timeline}</p>
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">{model.subtitle}</p>

                  <div className="my-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                    <strong className="text-slate-300 block mb-1">Best suited for:</strong>
                    {model.bestFor}
                  </div>

                  <div className="space-y-2.5">
                    {model.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={`/contact?service=${idx === 0 ? "business-automation" : idx === 1 ? "custom-erp-crm" : "managed-it-support"}`}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                      idx === 1
                        ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    Select Engagement
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-16 bg-[#060a12] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400/90 mb-8">
            Engineered on Battle-Tested Enterprise Foundations
          </p>
          <TechStackIcons />
        </div>
      </section>
    </div>
  );
}
