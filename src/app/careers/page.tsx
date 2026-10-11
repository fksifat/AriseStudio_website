import { Metadata } from "next";
import Link from "next/link";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Sparkles, 
  Coffee 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Careers & Culture | AriseStudio",
  description: "Join the AriseStudio engineering team. Build enterprise automation systems, custom ERPs, and cloud architectures.",
};

const openRoles = [
  {
    title: "Senior Full-Stack Automation Engineer (Node.js / Next.js)",
    department: "Engineering",
    location: "Dhaka (Hybrid) / Remote",
    type: "Full-time",
    desc: "Architect scalable automation pipelines, webhook receivers, and custom CRM/ERP modules for global clients.",
    requirements: [
      "4+ years with TypeScript, Next.js, and Node.js backend architectures",
      "Demonstrated experience with Redis, PostgreSQL, and message queues (Kafka / RabbitMQ)",
      "Strong API integration background (Shopify, Stripe, ERP systems)"
    ]
  },
  {
    title: "DevOps & 24/7 Site Reliability Engineer (SRE)",
    department: "Cloud Operations & Support",
    location: "Dhaka / Remote",
    type: "Full-time",
    desc: "Maintain multi-region Kubernetes clusters, automated zero-downtime rollouts, and lead our 24/7 enterprise IT response team.",
    requirements: [
      "Strong background in AWS / Google Cloud, Terraform, and Docker/Kubernetes",
      "Hands-on telemetry mastery: Prometheus, Grafana, ELK stack",
      "Experience setting up high-availability database failover mechanisms"
    ]
  },
  {
    title: "Python RPA & Process Automation Specialist",
    department: "Automation Lab",
    location: "Dhaka / Remote",
    type: "Full-time",
    desc: "Build robotic process automations, automated web scrapers, and AI document OCR processing engines.",
    requirements: [
      "3+ years Python mastery (FastAPI, Celery, Temporal.io, Playwright)",
      "Experience fine-tuning or integrating LLM vision/extraction APIs",
      "Solid knowledge of asynchronous architectures and enterprise security"
    ]
  }
];

export default function CareersPage() {
  return (
    <div className="pt-32 pb-24 relative bg-[#09101d] overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/30 via-[#0a814f]/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-0 w-[500px] h-[500px] bg-[#004157]/20 blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#a7f3d0] bg-[#004157]/40 border border-[#10b981]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          Join Our Engineering Guild
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Build Systems That <br className="hidden sm:inline" />
          <span className="gradient-text-teal-emerald">Millions Depend On</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
          At AriseStudio, we don&apos;t build disposable prototypes. We craft high-throughput, mission-critical automation systems and enterprise platforms.
        </p>
      </div>

      {/* Culture Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl enterprise-card">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#10b981]" />
              Complex Technical Challenges
            </h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Work directly with event-driven pipelines, distributed databases, high-concurrency commerce queues, and AI-driven workflow engines.
            </p>
          </div>

          <div className="p-8 rounded-2xl enterprise-card">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[#38bdf8]" />
              Developer-First Culture
            </h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Zero bureaucracy, modern tooling (GitHub, automated CI/CD, Linear), continuous learning stipends, and flexible hybrid options.
            </p>
          </div>

          <div className="p-8 rounded-2xl enterprise-card">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#a7f3d0]" />
              Transparent Growth & Bonuses
            </h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Competitive compensation, bi-annual performance evaluations, and project success bonuses tied to measurable client outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Open Engineering Positions</h2>

        <div className="space-y-6">
          {openRoles.map((role, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl enterprise-card shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="text-xl font-bold text-white">{role.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#10b981]" /> {role.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" /> {role.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#a7f3d0]" /> {role.type}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/contact?apply=${encodeURIComponent(role.title)}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-[#10b981] hover:bg-[#34d399] transition-colors shrink-0 shadow-lg shadow-[#10b981]/20"
                >
                  Apply for Role <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                {role.desc}
              </p>

              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Requirements:</p>
                {role.requirements.map((req, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
