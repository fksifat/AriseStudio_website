export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  features: string[];
  benefits: string[];
  techStack: string[];
}

export const servicesData: ServiceItem[] = [
  {
    id: "ecommerce",
    title: "E-Commerce Automation Systems",
    shortDesc: "Automate inventory sync, multi-store order routing, dynamic pricing, and warehouse logistics.",
    fullDesc: "We build unified, multi-channel commerce backbones that synchronize orders, stock levels, delivery partners (Pathao, Steadfast, DHL, FedEx), and accounting software automatically without manual data entry.",
    iconName: "ShoppingCart",
    features: [
      "Real-time Inventory Synchronization across Shopify, WooCommerce, Amazon & Custom Web",
      "Automated Order Dispatch & Shipping Label Generation",
      "Dynamic Pricing Bots & Competitor Price Tracking",
      "Abandoned Cart Multi-channel Recovery Flows (WhatsApp, SMS, Email)",
      "Automated Return & Refund RMA Workflows"
    ],
    benefits: [
      "99.8% reduction in order processing manual errors",
      "Same-day order fulfillment turnaround",
      "Effortless scaling to 50,000+ daily orders"
    ],
    techStack: ["Next.js", "Node.js", "Shopify API", "Stripe", "Redis", "Kafka", "PostgreSQL"]
  },
  {
    id: "erp-crm",
    title: "Custom ERP & CRM Engineering",
    shortDesc: "Tailor-made enterprise resource planning and client management systems mapped to your exact workflow.",
    fullDesc: "Off-the-shelf software forces your business to adapt to its limitations. AriseStudio engineers custom, modular ERP and CRM solutions that fit your organization's precise operational hierarchy and compliance rules.",
    iconName: "Database",
    features: [
      "Centralized Sales Pipeline & Lead Scoring Automation",
      "Multi-Warehouse Inventory & Supply Chain Tracking",
      "Automated Financial Bookkeeping & GST / NBR Tax Compliance",
      "Role-Based Access Control (RBAC) & Audit Trails",
      "Custom Executive KPI Dashboards with Real-time BI"
    ],
    benefits: [
      "Complete data sovereignty with zero recurring per-user SaaS license fees",
      "35% increase in operational team throughput",
      "Instant consolidated visibility across multiple branch locations"
    ],
    techStack: ["React", "NestJS", "PostgreSQL", "Docker", "TimescaleDB", "GraphQL"]
  },
  {
    id: "business-automation",
    title: "End-to-End Business Automation & RPA",
    shortDesc: "Eliminate repetitive manual busywork with intelligent robots, document processing, and scheduled triggers.",
    fullDesc: "We transform fragmented spreadsheets, email approvals, and manual calculations into smooth, error-free automated pipelines that run 24/7 in the background.",
    iconName: "Layers",
    features: [
      "Robotic Process Automation (RPA) for Legacy Enterprise Portals",
      "AI OCR Document Extraction (Invoices, Bills of Lading, Purchase Orders)",
      "Automated Employee Onboarding & Payroll Calculations",
      "Multi-stage Approval Chains via Slack, Microsoft Teams, or WhatsApp",
      "Scheduled Data Aggregation & Automated PDF Management Reports"
    ],
    benefits: [
      "Saves over 120+ staff hours per department monthly",
      "Eliminates invoice data-entry typos and duplicate payments",
      "Real-time alerts for business anomalies and threshold breaches"
    ],
    techStack: ["Python", "Temporal.io", "OpenAI / Claude API", "Playwright", "FastAPI"]
  },
  {
    id: "it-support",
    title: "24/7 Managed IT Support & Infrastructure",
    shortDesc: "Round-the-clock server health monitoring, disaster recovery, cloud cost optimization, and L1-L3 tech support.",
    fullDesc: "Keep your mission-critical web applications and workplace infrastructure secure, responsive, and resilient. Our dedicated engineering desk handles updates, uptime, and incident resolution around the clock.",
    iconName: "Headphones",
    features: [
      "24/7/365 Proactive Server & Microservice Uptime Monitoring",
      "DevOps CI/CD Automation & Automated Zero-downtime Rollouts",
      "Automated Cloud Backups & Instant Disaster Recovery Failover",
      "Comprehensive Cyber Audits, Firewall Hardening & SSL Management",
      "Dedicated Helpdesk with 15-Minute Critical SLA Guarantee"
    ],
    benefits: [
      "99.99% guaranteed infrastructure uptime",
      "Immediate mitigation of DDoS and malicious intrusion attempts",
      "Predictable IT expenditure without hiring expensive in-house teams"
    ],
    techStack: ["AWS", "Google Cloud", "Kubernetes", "Terraform", "Prometheus", "Grafana"]
  }
];

export const caseStudiesData = [
  {
    client: "Apex OmniCommerce",
    industry: "Retail & E-Commerce",
    metric: "450% Order Growth with Zero Additional Staff",
    description: "Built an omnichannel inventory synchronizer linking 14 physical outlets with online web stores and courier API integrations.",
    tags: ["E-Commerce Automation", "Next.js", "Warehouse Sync"]
  },
  {
    client: "Nordic Logistics Ltd.",
    industry: "Freight & Transport",
    metric: "92% Reduction in Invoice Processing Delay",
    description: "Automated OCR bill of lading parsing and integrated an automated customs clearance audit checklist pipeline.",
    tags: ["Custom ERP", "AI OCR", "Process Automation"]
  },
  {
    client: "FinTrust MicroCapital",
    industry: "Financial Services",
    metric: "100% Uptime Across Peak Payment Cycles",
    description: "Architected high-availability cloud cluster, automated failovers, and established 24/7 Level 3 proactive system monitoring.",
    tags: ["Managed IT Support", "DevOps", "AWS High-Availability"]
  }
];

export const teamPhilosophy = {
  headline: "Engineering Excellence with Global Standards",
  subheadline: "Inspired by the rigorous work ethics of top-tier technology enterprises, AriseStudio blends architectural depth with modern agility.",
  values: [
    {
      title: "Zero-Compromise Architecture",
      desc: "We write clean, modular, and maintainable software designed to scale to millions of requests without breaking."
    },
    {
      title: "Measurable Business Impact",
      desc: "We don't just write code; we measure success by saved payroll hours, reduced overhead, and multiplied revenue."
    },
    {
      title: "Transparent & Agile Delivery",
      desc: "Weekly sprints, clear sprint burndowns, shared staging environments, and constant communication."
    },
    {
      title: "Unwavering Security & SLA",
      desc: "Enterprise data encryption, strict RBAC, and dedicated response desks built for mission-critical operations."
    }
  ]
};

