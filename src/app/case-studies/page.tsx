import { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert, 
  Zap,
  Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies & Client Success | AriseStudio",
  description: "Real-world engineering case studies showcasing automation, ERP overhauls, and IT support results by AriseStudio.",
};

const fullStudies = [
  {
    title: "Apex OmniCommerce: Multi-Channel Order & Inventory Synchronizer",
    client: "Apex OmniCommerce (Retail Giant)",
    industry: "Retail & E-Commerce",
    overview: "Managing 14 physical retail branches alongside Shopify and Daraz web stores was causing inventory overselling, stockout chaos, and an average fulfillment lag of 48 hours.",
    solution: "AriseStudio engineered a real-time event-driven hub built on Next.js, Redis, and Webhooks. Every sales register or online transaction immediately locks stock across all channels within 120 milliseconds.",
    results: [
      "450% surge in daily online order handling capacity",
      "99.4% elimination of customer refund cancellations caused by overselling",
      "Automated courier consignment booking saving 18 staff hours daily"
    ],
    tech: ["Next.js", "Node.js", "Redis Queue", "Shopify Webhooks", "PostgreSQL"]
  },
  {
    title: "Nordic Logistics: Paperless Customs & Automated Freight Tracking",
    client: "Nordic Freight International",
    industry: "Freight Forwarding & Customs",
    overview: "Customs paper manifests and freight bills of lading were manually re-typed by clerks, resulting in costly data-entry errors and clearance bottlenecks.",
    solution: "Implemented an automated OCR and LLM-assisted document parsing pipeline connected directly into their custom cloud ERP. Documents uploaded via mobile are automatically validated against customs tariffs.",
    results: [
      "92% reduction in manifest processing turnaround time",
      "Zero compliance fines across 12 consecutive months",
      "Instant client consignment tracking portal with live milestone updates"
    ],
    tech: ["Python", "FastAPI", "OCR Pipeline", "Docker", "React ERP"]
  },
  {
    title: "FinTrust MicroCapital: High-Availability Cloud Infrastructure & 24/7 IT Desk",
    client: "FinTrust MicroCapital Ltd.",
    industry: "Financial & Loan Services",
    overview: "Unplanned server crashes during monthly repayment collection cycles caused reputational damage and lost transaction logs.",
    solution: "Architected a multi-zone AWS Kubernetes cluster with automated horizontal pod autoscaling, automated database failover, and established an around-the-clock L3 engineering response team.",
    results: [
      "100% server availability across 18 peak settlement windows",
      "Average incident mitigation speed under 8 minutes",
      "38% decrease in unnecessary cloud hosting expenses via rightsizing"
    ],
    tech: ["AWS EKS", "Terraform", "Prometheus", "PostgreSQL Replication", "Cloudflare"]
  }
];

export default function CaseStudiesPage() {
  return (
    <div className="pt-32 pb-24 relative bg-[#09101d] overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/30 via-[#0a814f]/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[#004157]/20 blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#a7f3d0] bg-[#004157]/40 border border-[#10b981]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          Proven Track Record
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Client Case Studies & <br className="hidden sm:inline" />
          <span className="gradient-text-teal-emerald">Measurable Outcomes</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
          Explore how AriseStudio has solved complex operational hurdles, automated repetitive workflows, and protected system uptime for fast-growing businesses.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {fullStudies.map((study, idx) => (
          <article
            key={idx}
            className="rounded-3xl enterprise-card p-8 sm:p-12 shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div>
                <span className="text-xs font-mono uppercase text-[#10b981] font-semibold">
                  {study.industry}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {study.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">Client: {study.client}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {study.tech.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-[#004157]/30 text-[#a7f3d0] font-mono border border-[#004157]/50">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
              {/* Problem */}
              <div className="p-6 rounded-2xl bg-[#09101d] border border-rose-500/20">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> The Challenge
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {study.overview}
                </p>
              </div>

              {/* Solution */}
              <div className="p-6 rounded-2xl bg-[#004157]/20 border border-[#10b981]/30">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#10b981] mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> The Engineering Solution
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {study.solution}
                </p>
              </div>

              {/* Verified Results */}
              <div className="p-6 rounded-2xl bg-[#004157]/30 border border-[#10b981]/40">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#a7f3d0] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10b981]" /> Business Outcomes
                </h3>
                <div className="space-y-2.5">
                  {study.results.map((res, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Want similar outcomes for your business?</span>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10b981] hover:text-[#34d399]"
              >
                Schedule an architecture audit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
