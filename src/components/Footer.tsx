import Link from "next/link";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#070b14] border-t border-emerald-950/40 text-slate-400">
      {/* Top Banner / Pre-footer Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-800/60">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0d1627] to-[#0a0f1d] border border-emerald-500/20 p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Ready to modernize your operations?
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-3">
              Automate routine work, eliminate bottlenecks, and scale your business with AriseStudio.
            </h3>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Book an engineering consultation today. We review your existing workflow and deliver an actionable modernization plan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20 text-sm whitespace-nowrap"
            >
              Request Free Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group py-1">
              <div className="relative h-10 w-52 flex items-center">
                <Image 
                  src="/brand/arisestudio-logo-darkmode.png" 
                  alt="AriseStudio Official Logo"
                  fill
                  sizes="208px"
                  className="object-contain filter drop-shadow group-hover:brightness-110 transition-all"
                />
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              AriseStudio builds mission-critical automation systems, custom ERP/CRM platforms, e-commerce synchronizers, and round-the-clock enterprise IT support engineered for stability and exponential growth.
            </p>
            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter / X" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Core Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services#ecommerce" className="hover:text-emerald-400 transition-colors">
                  E-Commerce Automation
                </Link>
              </li>
              <li>
                <Link href="/services#erp-crm" className="hover:text-emerald-400 transition-colors">
                  Custom ERP & CRM
                </Link>
              </li>
              <li>
                <Link href="/services#business-automation" className="hover:text-emerald-400 transition-colors">
                  Business Process Automation
                </Link>
              </li>
              <li>
                <Link href="/services#it-support" className="hover:text-emerald-400 transition-colors">
                  24/7 Managed IT Support
                </Link>
              </li>
              <li>
                <Link href="/services#cloud" className="hover:text-emerald-400 transition-colors">
                  Cloud Infrastructure & DevOps
                </Link>
              </li>
              <li>
                <Link href="/services#api" className="hover:text-emerald-400 transition-colors">
                  API & Legacy Systems Integration
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & In-House Products */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Products & Solutions
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#products" className="text-emerald-300 font-semibold hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  AriseSell Platform
                </Link>
              </li>
              <li>
                <Link href="/solutions#retail" className="hover:text-emerald-400 transition-colors">
                  Retail & Omnichannel
                </Link>
              </li>
              <li>
                <Link href="/solutions#logistics" className="hover:text-emerald-400 transition-colors">
                  Supply Chain & Logistics
                </Link>
              </li>
              <li>
                <Link href="/solutions#finance" className="hover:text-emerald-400 transition-colors">
                  Financial Workflows & Invoicing
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-emerald-400 transition-colors">
                  Customer Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Quick Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Direct Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh / Global Remote Operations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:contact@arisestudio.com" className="hover:text-white transition-colors">
                  contact@arisestudio.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+8801700000000" className="hover:text-white transition-colors">
                  +880 (17) 0000-0000
                </a>
              </li>
              <li className="pt-2 text-xs text-slate-500">
                Support Hours: 24/7/365 On-Call & SLAs Available
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AriseStudio Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-400 transition-colors">Security Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
