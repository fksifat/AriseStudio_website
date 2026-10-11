import { Metadata } from "next";
import Link from "next/link";
import { 
  ShoppingCart, 
  Truck, 
  Receipt, 
  Factory, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Industry Solutions | AriseStudio",
  description: "Industry-tailored automation solutions for retail, omnichannel logistics, healthcare, manufacturing, and financial services.",
};

const solutions = [
  {
    id: "retail",
    icon: ShoppingCart,
    title: "Retail & Omnichannel Commerce",
    subtitle: "Synchronize stores, warehouses, and online marketplaces in real-time.",
    challenges: [
      "Inventory mismatches leading to overselling or delayed customer orders",
      "Manual data entry into courier software & tracking number copy-pasting",
      "Disconnected point-of-sale (POS) and online web shop ledgers"
    ],
    solutionsProvided: [
      "Real-time bidirectional inventory balancer (<150ms sync speed)",
      "Automated order dispatch with Pathao, Steadfast, and international freight APIs",
      "Consolidated multi-outlet sales analytics and automated restocking reorders"
    ],
    metrics: "40% reduction in fulfillment turnaround time"
  },
  {
    id: "logistics",
    icon: Truck,
    title: "Supply Chain & Logistics Management",
    subtitle: "Automate fleet tracking, freight consignment, and warehouse slotting.",
    challenges: [
      "Physical paper manifests and lost documentation in transit",
      "Lack of real-time consignment visibility for shippers & consignees",
      "Slow, manual route allocation causing fuel and driver wastage"
    ],
    solutionsProvided: [
      "Custom ERP module for warehouse bin management & barcode scanning",
      "Automated bill of lading OCR parser and digital consignment vault",
      "Driver mobile companion app with proof-of-delivery GPS sync"
    ],
    metrics: "90% paperless logistics processing achieved"
  },
  {
    id: "finance",
    icon: Receipt,
    title: "Finance, Billing & Automated Invoicing",
    subtitle: "Eliminate invoice discrepancies, track approvals, and automate tax compliance.",
    challenges: [
      "Late customer payments due to forgotten invoice follow-ups",
      "Tedious manual reconciliation between bank statements and sales ledgers",
      "Complex NBR / local tax computation errors and filing lag"
    ],
    solutionsProvided: [
      "Automated recurring subscription & milestone billing engine",
      "Automated bank ledger reconciliation bots with anomaly flags",
      "Multi-level approval workflow with immutable audit logging"
    ],
    metrics: "Eliminates duplicate payments and reduces DSO by 18 days"
  },
  {
    id: "manufacturing",
    icon: Factory,
    title: "Manufacturing & Assembly ERP",
    subtitle: "Complete control over raw material procurement, BOM, and production batches.",
    challenges: [
      "Inaccurate Bill of Materials (BOM) resulting in factory floor halts",
      "Difficulty tracking scrap and wastage rates per shift",
      "Unscheduled machine downtimes hurting contract delivery dates"
    ],
    solutionsProvided: [
      "Dynamic multi-level BOM calculator and automated procurement triggers",
      "Factory floor production tracking with operator touchscreens",
      "Preventative machine maintenance schedule automation"
    ],
    metrics: "25% boost in factory floor machine utilization"
  }
];

export default function SolutionsPage() {
  return (
    <div className="pt-32 pb-24 relative bg-[#09101d] overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/30 via-[#0a814f]/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-0 w-[500px] h-[500px] bg-[#004157]/20 blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#a7f3d0] bg-[#004157]/40 border border-[#10b981]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          Industry-Specific Architectures
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Automation Tailored to <br className="hidden sm:inline" />
          <span className="gradient-text-teal-emerald">Your Exact Industry</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
          Every industry has distinct regulatory requirements, operational quirks, and bottlenecks. We architect purpose-built solutions designed to deliver maximum operational leverage.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {solutions.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              className="scroll-mt-32 rounded-3xl enterprise-card p-8 sm:p-12 shadow-2xl"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#004157]/50 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{item.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">{item.subtitle}</p>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-[#004157]/40 border border-[#10b981]/30 text-[#a7f3d0] text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  <span>{item.metrics}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                {/* Traditional Bottlenecks */}
                <div className="p-6 rounded-2xl bg-[#09101d] border border-rose-500/20">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-2">
                    <span>Common Friction & Manual Bottlenecks</span>
                  </h3>
                  <div className="space-y-3">
                    {item.challenges.map((ch, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AriseStudio Engineered Solution */}
                <div className="p-6 rounded-2xl bg-[#004157]/20 border border-[#10b981]/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#10b981] mb-4 flex items-center gap-2">
                    <span>AriseStudio Engineered Architecture</span>
                  </h3>
                  <div className="space-y-3">
                    {item.solutionsProvided.map((sol, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{sol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Link
                  href={`/contact?industry=${item.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#10b981] hover:text-[#34d399]"
                >
                  Discuss your industry requirements with an architect <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
