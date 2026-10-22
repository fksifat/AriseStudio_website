import { Suspense } from "react";
import { Metadata } from "next";
import { Sparkles, ShieldCheck, Zap, Clock, Calendar as CalendarIcon, Video, ExternalLink, Loader2 } from "lucide-react";
import AppointmentScheduler from "@/components/AppointmentScheduler";

export const metadata: Metadata = {
  title: "Schedule a Call | AriseStudio",
  description: "Book a 30-minute technical architecture discovery call with AriseStudio's lead engineering team.",
};

export default function SchedulePage() {
  const calendarUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL || "https://calendar.app.google/MyNMsFKHdnP1fgTL6";
  const meetUrl = process.env.NEXT_PUBLIC_GOOGLE_MEET_URL || "";

  return (
    <div className="pt-32 pb-24 relative bg-[#09101d] overflow-hidden min-h-screen">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#004157]/25 via-[#0a814f]/15 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[#004157]/20 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Top Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-300 bg-[#004157]/40 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Direct Engineering Access
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Schedule a 30-Minute <br className="hidden sm:inline" />
            <span className="gradient-text-teal-emerald">Architecture Discovery Call</span>
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            Pick a time that fits your schedule. You will speak directly with a Principal Systems Engineer—not a sales representative.
          </p>

          {/* Quick value badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> 30-Min Focused Audit
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> Actionable Blueprint
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Zero Obligation
            </span>
          </div>

          {/* Direct External Calendar & Meet Quick Banner */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-[#004157]/40 via-slate-900/80 to-[#0a814f]/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  Official Google Calendar Appointment
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Embedded Below
                  </span>
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <Video className="w-3.5 h-3.5 text-sky-400 inline shrink-0" />
                  <span>Choose any open slot directly below without leaving this website · Google Meet auto-generated</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-emerald-300 hover:text-white bg-slate-800/80 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all shadow-sm"
              >
                <span>Open in Full Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {meetUrl && (
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-sky-500/20 border border-slate-700/80 hover:border-sky-400 transition-all"
                  title="Direct Google Meet Room"
                >
                  <Video className="w-3.5 h-3.5 text-sky-400" />
                  <span>Meet Link</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Scheduler Widget */}
        <Suspense
          fallback={
            <div className="w-full max-w-6xl mx-auto p-12 text-center flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span className="text-sm font-mono">Loading appointment scheduler...</span>
            </div>
          }
        >
          <AppointmentScheduler />
        </Suspense>
      </div>
    </div>
  );
}

