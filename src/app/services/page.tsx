import { Metadata } from "next";
import Link from "next/link";
import { 
  ShoppingCart, 
  Database, 
  Layers, 
  Headphones, 
  CheckCircle2, 
  ArrowRight, 
  Zap,
  Sparkles,
  GitBranch,
  FileCheck2,
  Lock,
  Headset
} from "lucide-react";
import { servicesData } from "@/data/companyData";

export const metadata: Metadata = {
  title: "Services & Capabilities | AriseStudio",
  description: "Explore AriseStudio's core services: E-Commerce Automation, Custom ERP & CRM Development, Robotic Process Automation, and 24/7 Managed IT Support.",
};

const deliverables = [
  {
    icon: GitBranch,
    title: "Complete Source Code & Git Repository",
    desc: "100% intellectual property ownership with modular, documented TypeScript & Python code."
  },
  {
    icon: FileCheck2,
    title: "Database Schemas & Automated Migrations",
    desc: "Idempotent migration scripts and entity diagrams ensuring zero data loss during version upgrades."
  },
  {
    icon: Lock,
    title: "CI/CD & Infrastructure as Code (IaC)",
    desc: "Automated Docker, Kubernetes, or serverless build scripts with automated secret rotation."
  },
  {
    icon: Headset,
    title: "30-Day Post-Launch Hypercare",
    desc: "Direct engineer-to-client Slack / WhatsApp bridge for instant bug fixes and operational guidance."
  }
];

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-24 relative bg-[#09101d] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/25 via-[#0a814f]/15 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[#004157]/20 blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-300 bg-[#004157]/40 border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Technical Specializations & Pods
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mt-4 tracking-tight">
          Bespoke Automation Engines & <br className="hidden sm:inline" />
          <span className="gradient-text-teal-emerald">Enterprise Systems Architecture</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          We replace fragmented spreadsheets, manual data transcription, and brittle off-the-shelf software with resilient systems engineered around your exact business model.
        </p>
      </div>

      {/* Service Blocks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {servicesData.map((service, index) => {
          let IconComp = ShoppingCart;
          if (service.id === "erp-crm") IconComp = Database;
          if (service.id === "business-automation") IconComp = Layers;
          if (service.id === "it-support") IconComp = Headphones;

          const isEven = index % 2 === 0;

          return (
            <section
              key={service.id}
              id={service.id}
              className={`scroll-mt-32 rounded-3xl bg-[#09101d] border border-white/[0.08] p-8 sm:p-12 lg:p-14 flex flex-col ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center hover:border-emerald-500/30 transition-all shadow-xl`}
            >
              {/* Left Column: Descriptions & Details */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#004157]/50 text-emerald-300 text-xs font-mono font-semibold border border-emerald-500/30">
                  <IconComp className="w-4 h-4 text-emerald-400" />
                  <span>Architecture Module 0{index + 1}</span>
                </div>

                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  {service.title}
                </h2>

                <p className="text-base text-slate-300 leading-relaxed">
                  {service.fullDesc}
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Core Capabilities & Engineering Scope:
                  </h4>
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-400 font-mono py-1 pr-2">Technologies:</span>
                  {service.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#004157]/30 text-emerald-300 font-mono border border-emerald-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href={`/contact?service=${service.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors text-sm shadow-lg shadow-emerald-500/20"
                  >
                    Consult on this Solution
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Key Benefits Card / Visual Metric */}
              <div className="w-full lg:w-96 shrink-0">
                <div className="rounded-2xl bg-[#004157]/20 border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Measurable ROI
                  </h3>

                  <div className="space-y-4">
                    {service.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <p className="text-xs text-slate-400 font-mono font-medium">Outcome Metric 0{bIdx + 1}</p>
                        <p className="text-sm font-semibold text-slate-100 mt-1">{benefit}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-[#004157]/40 border border-emerald-500/30 text-xs text-emerald-300">
                    <p className="font-semibold text-white">Delivery SLA</p>
                    <p className="text-slate-300 mt-1">Typical rollout: 2 to 6 weeks with zero business disruption guarantee.</p>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* What You Receive / Standard Deliverables */}
      <section className="mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
            Standard Operating Procedure
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">What You Receive in Every Handover</h2>
          <p className="text-slate-400 text-sm mt-2">
            We don&apos;t leave you with mysterious black-box binaries. You receive full developer assets and complete operational transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliverables.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-[#09101d] border border-white/[0.08] hover:border-emerald-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#004157]/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
