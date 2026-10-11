import { Metadata } from "next";
import Link from "next/link";
import { 
  Target, 
  ShieldCheck, 
  ArrowRight, 
  Code2, 
  Terminal, 
  HeartHandshake,
  Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | AriseStudio",
  description: "Learn about AriseStudio - our mission, engineering culture, leadership philosophy, and commitment to building world-class automation and IT systems.",
};

const principles = [
  {
    icon: Code2,
    title: "Disciplined Software Craftsmanship",
    desc: "Drawing inspiration from technology powerhouses like Brain Station 23, Enosis Solutions, and Therap BD, we prioritize clean modular architecture, automated test suites, and strict code review cycles."
  },
  {
    icon: Target,
    title: "Client Profitability First",
    desc: "We consider software a capital investment. Every workflow we automate and every line of code we write is judged by how much time, money, and error it eliminates for our partners."
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Reliability & Security",
    desc: "We enforce OWASP Top 10 compliance, end-to-end data encryption, automated multi-region backups, and strict non-disclosure safeguards across all engagements."
  },
  {
    icon: HeartHandshake,
    title: "Long-Term Engineering Partnership",
    desc: "We don't disappear after deployment. With our 24/7 managed support desks and continuous optimization roadmaps, we grow alongside your business."
  }
];

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 relative bg-[#09101d] overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/30 via-[#0a814f]/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-[#004157]/20 blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#a7f3d0] bg-[#004157]/40 border border-[#10b981]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          Who We Are
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Empowering Enterprises Through <br className="hidden sm:inline" />
          <span className="gradient-text-teal-emerald">Automation & Technology</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          AriseStudio was founded with a singular conviction: businesses shouldn&apos;t waste their best human talent on repetitive busywork. We design, deploy, and operate the digital nervous system for modern enterprises.
        </p>
      </div>

      {/* Story & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="rounded-3xl enterprise-card p-8 sm:p-14 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase text-[#10b981] font-semibold tracking-wider">
                Engineering Heritage
              </span>
              <h2 className="text-3xl font-bold text-white">Our Story & Ambition</h2>
              <p className="text-slate-300 leading-relaxed text-base">
                We observed that while enterprise corporations invest millions in custom systems, growing businesses are frequently trapped between rigid, per-user SaaS bills and chaotic manual spreadsheets.
              </p>
              <p className="text-slate-300 leading-relaxed text-base">
                AriseStudio bridges that gap. We build custom-tailored automation platforms, scalable ERP and CRM systems, and e-commerce infrastructure that clients own outright—backed by a 24/7 dedicated IT engineering desk.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#004157]/50 border border-[#10b981]/30 text-[#10b981]">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Engineered in Dhaka, Operating Globally</h4>
                  <p className="text-xs text-slate-400">Serving clients across North America, Europe, the Middle East, and South Asia.</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid with Brand Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#09101d] border border-[#004157]/50 hover:border-[#10b981]/40 transition-colors">
                <p className="text-4xl font-extrabold text-[#10b981]">100%</p>
                <p className="text-sm font-semibold text-white mt-2">Code & IP Ownership</p>
                <p className="text-xs text-slate-400 mt-1">Full source code rights and complete database sovereignty.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#09101d] border border-[#004157]/50 hover:border-[#10b981]/40 transition-colors">
                <p className="text-4xl font-extrabold text-[#38bdf8]">24/7</p>
                <p className="text-sm font-semibold text-white mt-2">Engineers On Call</p>
                <p className="text-xs text-slate-400 mt-1">Rapid escalation desk ready for mission-critical operations.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#09101d] border border-[#004157]/50 hover:border-[#10b981]/40 transition-colors">
                <p className="text-4xl font-extrabold text-[#a7f3d0]">0 min</p>
                <p className="text-sm font-semibold text-white mt-2">Unplanned Downtime</p>
                <p className="text-xs text-slate-400 mt-1">Zero-downtime rolling deploys and health telemetries.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#09101d] border border-[#004157]/50 hover:border-[#10b981]/40 transition-colors">
                <p className="text-4xl font-extrabold text-[#10b981]">15 min</p>
                <p className="text-sm font-semibold text-white mt-2">Critical Incident SLA</p>
                <p className="text-xs text-slate-400 mt-1">Contractual response guarantee for priority issues.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Engineering Principles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#a7f3d0] bg-[#004157]/40 border border-[#10b981]/30">
            Our Culture
          </span>
          <h2 className="text-3xl font-bold text-white mt-3">The Principles We Code By</h2>
          <p className="text-slate-400 mt-2 text-sm">
            Standards designed to assure peace of mind for every stakeholder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((pr, idx) => {
            const Icon = pr.icon;
            return (
              <div key={idx} className="p-8 rounded-2xl enterprise-card">
                <div className="w-12 h-12 rounded-xl bg-[#004157]/50 border border-[#10b981]/30 text-[#10b981] flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{pr.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{pr.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Box */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-[#004157]/40 via-[#09101d] to-[#0a814f]/30 border border-[#10b981]/30 p-10 sm:p-14 shadow-2xl">
          <h2 className="text-3xl font-bold text-white">Let&apos;s Discuss Your Technical Roadmap</h2>
          <p className="text-slate-300 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Whether you want to build a full custom ERP from the ground up, automate your e-commerce operations, or hand over your infrastructure to a 24/7 team, we are ready.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-slate-950 bg-[#10b981] hover:bg-[#34d399] transition-all shadow-xl shadow-[#10b981]/30"
            >
              Get in Touch with an Engineer <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
