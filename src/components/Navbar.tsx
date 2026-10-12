"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  Menu, 
  X, 
  ChevronDown, 
  ShoppingCart, 
  Database, 
  Layers, 
  Headphones, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expertiseDropdown, setExpertiseDropdown] = useState(false);

  const scheduleHref = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL || "https://calendar.app.google/MyNMsFKHdnP1fgTL6";
  const isExternalSchedule = scheduleHref.startsWith("http");

  const navLinks = [
    { name: "About", href: "/about" },
    { 
      name: "Expertise", 
      href: "/services", 
      hasDropdown: true 
    },
    { name: "Solutions", href: "/solutions" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ];

  const serviceCategories = [
    {
      title: "E-Commerce Automation",
      desc: "Multi-channel syncing, inventory bots & order fulfillment pipelines",
      icon: ShoppingCart,
      href: "/services#ecommerce",
    },
    {
      title: "Custom CRM & ERP",
      desc: "Tailored resource planning, customer data pipelines & reporting",
      icon: Database,
      href: "/services#erp-crm",
    },
    {
      title: "Business Process Automation",
      desc: "RPA, automated invoicing, AI document extraction & approvals",
      icon: Layers,
      href: "/services#business-automation",
    },
    {
      title: "Managed IT & 24/7 Support",
      desc: "Cloud infrastructure, DevOps, cyber protection & rapid response",
      icon: Headphones,
      href: "/services#it-support",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 enosis-navbar-bg shadow-lg shadow-black/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[68px]">
          
          {/* Official AriseStudio Brand Logo */}
          <Link href="/" className="flex items-center group select-none py-1">
            {/* Official AriseStudio Vector Wordmark Logo */}
            <div className="relative h-10 sm:h-12 w-48 sm:w-60 flex items-center">
              <Image 
                src="/brand/arisestudio-logo-darkmode.png" 
                alt="AriseStudio Official Logo"
                fill
                sizes="(max-width: 640px) 192px, 240px"
                className="object-contain filter drop-shadow group-hover:brightness-110 transition-all"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div 
                    key={link.name} 
                    className="relative"
                    onMouseEnter={() => setExpertiseDropdown(true)}
                    onMouseLeave={() => setExpertiseDropdown(false)}
                  >
                    <Link
                      href={link.href}
                      className="text-[14px] font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 py-2 tracking-wide group"
                    >
                      <span>{link.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expertiseDropdown ? "rotate-180 text-emerald-400" : "group-hover:text-emerald-400"}`} />
                    </Link>

                    {/* Mega Dropdown for Expertise */}
                    {expertiseDropdown && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[540px] bg-[#222838] border border-slate-700/80 rounded-2xl shadow-2xl p-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-xl">
                        {serviceCategories.map((srv) => {
                          const Icon = srv.icon;
                          return (
                            <Link
                              key={srv.title}
                              href={srv.href}
                              onClick={() => setExpertiseDropdown(false)}
                              className="group p-3 rounded-xl hover:bg-[#2b3347] transition-all border border-transparent hover:border-emerald-500/30"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                    {srv.title}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                    {srv.desc}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                        <div className="col-span-2 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 px-2">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Looking for bespoke architecture?
                          </span>
                          <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                            Schedule a free technical audit <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[14px] font-medium text-slate-200 hover:text-white hover:text-emerald-300 transition-colors py-2 tracking-wide"
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Enosis-Style Pill Button: "Schedule a Call" */}
          <div className="hidden lg:flex items-center">
            <Link
              href={scheduleHref}
              {...(isExternalSchedule ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center justify-center px-6 py-2 rounded-full border border-slate-400/50 hover:border-emerald-400 text-[13.5px] font-medium text-slate-100 hover:text-white bg-slate-900/30 hover:bg-emerald-500/10 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/15"
            >
              Schedule a Call
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[#222838]/98 backdrop-blur-xl border-b border-slate-700/60 px-6 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800/60"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-700/60">
            <Link
              href={scheduleHref}
              {...(isExternalSchedule ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full py-2.5 rounded-full border border-slate-400/50 text-sm font-medium text-white bg-slate-800/60 hover:bg-emerald-500/20 transition-all"
            >
              Schedule a Call
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
