import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ShoppingCart, 
  Database, 
  Headphones, 
  Cpu,
  Sparkles
} from "lucide-react";
import { servicesData, caseStudiesData, teamPhilosophy } from "@/data/companyData";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-[#09101d]">
      {/* Background Gradients & Ambient Glows (Deep Teal #004157 + Forest #0a814f + Emerald #10b981) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/30 via-[#0a814f]/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[750px] left-0 w-[550px] h-[550px] bg-[#004157]/25 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1400px] right-0 w-[500px] h-[500px] bg-[#0a814f]/15 blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#10b981]/40 bg-[#004157]/40 text-[#a7f3d0] text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Next-Gen Enterprise Business Automation & IT Engineering</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Automate Your Workflows. <br />
              <span className="gradient-text-teal-emerald">Scale Without Friction.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              AriseStudio builds high-performance <strong>E-Commerce Automation</strong>, custom <strong>ERP & CRM Systems</strong>, robotic process engines, and provides dedicated <strong>24/7 Enterprise IT Support</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-950 bg-[#10b981] hover:bg-[#34d399] transition-all shadow-xl shadow-[#10b981]/25 hover:-translate-y-0.5 text-base"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-200 bg-[#004157]/40 hover:bg-[#004157]/60 border border-[#10b981]/30 transition-all text-base hover:text-white"
              >
                Explore Services & Tech Stack
              </Link>
            </div>

            {/* Quick Stat Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 rounded-2xl bg-[#004157]/20 border border-[#10b981]/20 backdrop-blur-md">
              <div className="text-center p-3 border-r border-slate-800/80 last:border-none">
                <p className="text-3xl sm:text-4xl font-extrabold text-white">99.9%</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Uptime SLA Guaranteed</p>
              </div>
              <div className="text-center p-3 md:border-r border-slate-800/80 last:border-none">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#10b981]">10x</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Faster Process Throughput</p>
              </div>
              <div className="text-center p-3 border-r border-slate-800/80 last:border-none">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#38bdf8]">24/7</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Dedicated IT Support Desk</p>
              </div>
              <div className="text-center p-3">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#a7f3d0]">0%</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">SaaS Recurring Seat Tax</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Venture / Product Showcase: AriseSell */}
      <section id="products" className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#004157]/30 via-[#09101d] to-[#0a814f]/25 border border-[#10b981]/30 shadow-2xl p-8 sm:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#a7f3d0] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Flagship In-House Product</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Meet <span className="gradient-text-teal-emerald">AriseSell</span> — The Complete Multi-Channel Automation Platform
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  Engineered and incubated directly by AriseStudio, <strong>AriseSell</strong> bridges e-commerce storefronts, inventory hubs, warehouse barcodes, courier parcel tracking, and accounting ledgers into one unified, autonomous engine.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                    <span>Real-time Inventory Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                    <span>Courier API Auto-Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                    <span>Omnichannel POS Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                    <span>Automated Return Management</span>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-4">
                  <Link
                    href="/contact?service=arisesell"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-950 bg-[#10b981] hover:bg-[#34d399] transition-colors text-sm shadow-lg shadow-[#10b981]/20"
                  >
                    Request AriseSell Demo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Brand Asset Card Visual with Authentic Cropped Logo */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="p-8 rounded-3xl bg-[#09101d] border border-[#10b981]/30 shadow-2xl flex flex-col items-center text-center relative max-w-sm w-full">
                  <div className="w-40 h-40 relative mb-4 p-3 bg-[#0a0f1d] rounded-2xl border border-[#10b981]/25 flex items-center justify-center shadow-lg shadow-[#10b981]/10">
                    <Image
                      src="/brand/arisesell-icon.svg"
                      alt="AriseSell Icon"
                      width={140}
                      height={140}
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

                  <p className="text-xs text-[#a7f3d0] font-mono uppercase tracking-wider mt-2">
                    Incubated by AriseStudio
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Color-graded in Deep Teal (<span className="text-slate-300 font-mono">#004157</span>), Forest Green (<span className="text-slate-300 font-mono">#0A814F</span>), and Vibrant Emerald (<span className="text-[#10b981] font-mono">#10B981</span>).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Preview / Architecture Showcase */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#004157]/15 border border-[#004157]/40 shadow-2xl overflow-hidden p-6 sm:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="ml-2 text-xs font-mono text-slate-400">AriseStudio Orchestration Engine v2.4</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">Automated Commerce & Enterprise Pipeline</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                  SYSTEM HEALTHY
                </span>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              <div className="p-4 rounded-xl bg-[#09101d] border border-[#004157]/40 relative hover:border-[#10b981]/40 transition-colors">
                <div className="text-xs font-mono text-[#10b981] uppercase tracking-wider mb-1">Step 01</div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#10b981]" /> Multi-Channel Inflow
                </h4>
                <p className="text-xs text-slate-400 mt-2">
                  Instant order hook from Shopify, WooCommerce, Amazon & POS terminals.
                </p>
                <div className="mt-3 text-[11px] font-mono text-[#10b981] bg-[#004157]/30 p-1.5 rounded">
                  ✓ 124 orders/sec ingested
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09101d] border border-[#004157]/40 relative hover:border-[#10b981]/40 transition-colors">
                <div className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider mb-1">Step 02</div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#38bdf8]" /> Automation Engine
                </h4>
                <p className="text-xs text-slate-400 mt-2">
                  Stock verification, tax computation, customer fraud detection & courier assignment.
                </p>
                <div className="mt-3 text-[11px] font-mono text-[#38bdf8] bg-[#004157]/30 p-1.5 rounded">
                  ⚡ 14ms routing latency
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09101d] border border-[#004157]/40 relative hover:border-[#10b981]/40 transition-colors">
                <div className="text-xs font-mono text-[#a7f3d0] uppercase tracking-wider mb-1">Step 03</div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#a7f3d0]" /> ERP & CRM Sync
                </h4>
                <p className="text-xs text-slate-400 mt-2">
                  Double-entry ledger sync, CRM timeline update & supplier restocking alerts.
                </p>
                <div className="mt-3 text-[11px] font-mono text-[#a7f3d0] bg-[#004157]/30 p-1.5 rounded">
                  ✓ Ledger balanced in real-time
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09101d] border border-[#004157]/40 relative hover:border-[#10b981]/40 transition-colors">
                <div className="text-xs font-mono text-[#10b981] uppercase tracking-wider mb-1">Step 04</div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#10b981]" /> 24/7 IT Surveillance
                </h4>
                <p className="text-xs text-slate-400 mt-2">
                  Prometheus metrics, distributed tracing, automated failover & backup snapshots.
                </p>
                <div className="mt-3 text-[11px] font-mono text-[#10b981] bg-[#004157]/30 p-1.5 rounded">
                  🛡️ 0 incidents logged
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-24 relative" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#10b981] bg-[#004157]/40 px-3 py-1 rounded-full border border-[#10b981]/30">
                Specialized Engineering
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                Solutions Designed to Drive Measurable Growth
              </h2>
              <p className="text-slate-400 mt-3 text-base">
                We empower startups, growing enterprises, and established corporate businesses with software architectures that run flawlessly under heavy load.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10b981] hover:text-[#34d399] transition-colors"
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
                  className="rounded-3xl bg-[#004157]/15 border border-[#004157]/35 p-8 hover:border-[#10b981]/40 transition-all hover:shadow-2xl hover:shadow-[#10b981]/10 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#004157]/40 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-6 group-hover:bg-[#10b981] group-hover:text-slate-950 transition-all">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#a7f3d0] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                      {service.fullDesc}
                    </p>

                    <div className="mt-6 space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Capabilities & Deliverables:
                      </p>
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {service.techStack.slice(0, 4).map((tech) => (
                        <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-[#004157]/30 text-[#a7f3d0] font-mono border border-[#004157]/40">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/services#${service.id}`}
                      className="text-xs font-semibold text-[#10b981] hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-all"
                    >
                      Deep Dive <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why AriseStudio (Enterprise Standards) */}
      <section className="py-20 bg-[#070c16] border-y border-[#004157]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#10b981] bg-[#004157]/40 px-3 py-1 rounded-full border border-[#10b981]/30">
              The AriseStudio Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
              Built for Scale, Resiliency & Enterprise Peace of Mind
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Inspired by the disciplined engineering processes of leading software powerhouses, we deliver systems you can depend on through massive traffic spikes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamPhilosophy.values.map((val, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-[#004157]/15 border border-[#004157]/30 hover:border-[#10b981]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#004157]/30 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] mb-4 font-bold font-mono">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies / Proven Results */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#10b981] bg-[#004157]/30 px-3 py-1 rounded-full border border-[#10b981]/25">
                Proven Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
                Measurable Value for Growing Businesses
              </h2>
            </div>
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10b981] hover:text-[#34d399]"
            >
              Browse all client success studies <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudiesData.map((cs, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#004157]/15 border border-[#004157]/35 hover:border-[#10b981]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {cs.industry}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{cs.client}</h3>
                  <div className="my-5 p-4 rounded-xl bg-[#004157]/30 border border-[#10b981]/20">
                    <p className="text-xs text-[#a7f3d0] uppercase font-semibold">Key Outcome</p>
                    <p className="text-lg font-bold text-white mt-0.5">{cs.metric}</p>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {cs.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                  {cs.tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-[#004157]/30 text-slate-300 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-16 bg-[#060a12] border-t border-[#004157]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10b981]/90 mb-8">
            Built on Industry-Leading Infrastructure & Enterprise Technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 text-sm font-semibold">
            <span className="hover:text-[#10b981] transition-colors">Next.js 16</span>
            <span className="hover:text-[#10b981] transition-colors">Node.js & NestJS</span>
            <span className="hover:text-[#10b981] transition-colors">Python Automation</span>
            <span className="hover:text-[#10b981] transition-colors">PostgreSQL</span>
            <span className="hover:text-[#10b981] transition-colors">Docker & Kubernetes</span>
            <span className="hover:text-[#10b981] transition-colors">AWS & GCP Cloud</span>
            <span className="hover:text-[#10b981] transition-colors">Temporal.io</span>
            <span className="hover:text-[#10b981] transition-colors">Redis Cluster</span>
          </div>
        </div>
      </section>
    </div>
  );
}
