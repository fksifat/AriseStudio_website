import { Metadata } from "next";
import Link from "next/link";
import { 
  ShoppingCart, 
  Database, 
  Layers, 
  Headphones, 
  CheckCircle2, 
  ArrowRight, 
  Zap 
} from "lucide-react";
import { servicesData } from "@/data/companyData";

export const metadata: Metadata = {
  title: "Services & Capabilities | AriseStudio",
  description: "Explore AriseStudio's core services: E-Commerce Automation, Custom ERP & CRM Development, Robotic Process Automation, and 24/7 Managed IT Support.",
};

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-24 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Our Specializations
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Enterprise-Grade Automation & Systems Engineering
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
          We replace fragmented tools, fragile spreadsheets, and repetitive human labor with resilient, custom software engines designed to scale with your ambition.
        </p>
      </div>

      {/* Service Blocks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
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
              className={`scroll-mt-32 rounded-3xl bg-[#0d1627]/60 border border-slate-800 p-8 sm:p-12 lg:p-16 flex flex-col ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
            >
              {/* Left Column: Descriptions & Details */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold">
                  <IconComp className="w-4 h-4" />
                  <span>Module 0{index + 1}</span>
                </div>

                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  {service.title}
                </h2>

                <p className="text-base text-slate-300 leading-relaxed">
                  {service.fullDesc}
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Core Capabilities
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
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-emerald-300 font-mono border border-slate-700/60"
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
                <div className="rounded-2xl bg-[#09101d] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Business Returns
                  </h3>

                  <div className="space-y-4">
                    {service.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="p-3.5 rounded-xl bg-[#0d1627] border border-slate-800/80">
                        <p className="text-xs text-slate-400 font-medium">Measurable Impact #{bIdx + 1}</p>
                        <p className="text-sm font-semibold text-slate-100 mt-1">{benefit}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                    <p className="font-semibold">Implementation Timeline</p>
                    <p className="text-slate-400 mt-1">Typical rollout: 2 to 6 weeks with zero business disruption guarantee.</p>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Engagement Models */}
      <section className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white">How We Collaborate</h2>
          <p className="text-slate-400 mt-2">Flexible engagement models tailored for your organization&apos;s stage and roadmap.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#0d1627]/50 border border-slate-800">
            <h3 className="text-xl font-bold text-white">Fixed-Scope Project</h3>
            <p className="text-slate-400 text-sm mt-2">
              Ideal for building specific systems like a custom ERP module, e-commerce automation pipeline, or document extraction engine.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li>• Clear milestone deliverables</li>
              <li>• Fixed timeline & guaranteed budget</li>
              <li>• 60-day post-launch warranty support</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-[#0d1627]/70 border border-emerald-500/40 relative shadow-xl shadow-emerald-500/10">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-bold uppercase">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white">Dedicated Engineering Squad</h3>
            <p className="text-slate-400 text-sm mt-2">
              A cross-functional team of full-stack engineers, QA analysts, and automation architects integrated with your leadership.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li>• Weekly agile sprints & continuous deployment</li>
              <li>• Scale team up or down with 30-day notice</li>
              <li>• Full source code & IP ownership transfer</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-[#0d1627]/50 border border-slate-800">
            <h3 className="text-xl font-bold text-white">24/7 Managed IT Retainer</h3>
            <p className="text-slate-400 text-sm mt-2">
              Complete peace of mind for your servers, databases, security monitoring, and round-the-clock incident response.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li>• 15-minute emergency SLA</li>
              <li>• Continuous vulnerability scanning & backups</li>
              <li>• Dedicated Slack/Teams escalation bridge</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
