"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  Clock,
  Video,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  Globe,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface DaySchedule {
  dayName: string;
  dayShort: string;
  dateNumber: number;
  fullDate: string;
  slots: string[];
}

const emptySubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

const defaultSlotsByWeekday: Record<number, string[]> = {
  0: ["10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"], // Sunday
  1: ["10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"], // Monday
  2: ["10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"], // Tuesday
  3: ["10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"], // Wednesday
  4: ["10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"], // Thursday
  5: [], // Friday: Studio Closed / Maintenance
  6: ["11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"], // Saturday (9:00am removed)
};

const dayShortNames = ["SUN", "M", "TUE", "WED", "THU", "FRI", "SAT"];
const dayFullNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function generateRollingSchedule(
  daysCount: number = 7,
  refDate: Date = new Date(),
): DaySchedule[] {
  const days: DaySchedule[] = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() + i);
    const dayOfWeek = d.getDay();
    const dayName = dayFullNames[dayOfWeek];
    const dayShort = dayShortNames[dayOfWeek];
    const dateNumber = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const fullDate = `${dayName}, ${month} ${dateNumber}, ${year}`;
    days.push({
      dayName,
      dayShort,
      dateNumber,
      fullDate,
      slots: defaultSlotsByWeekday[dayOfWeek] || [],
    });
  }
  return days;
}

const timezones = [
  "Bangladesh Time (BST / UTC+6)",
  "Eastern Time (US & Canada, UTC-4)",
  "Pacific Time (US & Canada, UTC-7)",
  "GMT / London (UTC+0)",
  "Central European Time (UTC+1)",
  "Dubai / Gulf Time (UTC+4)",
  "Singapore / SGT (UTC+8)",
];

export default function AppointmentScheduler() {
  const calendarUrl =
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ||
    "https://calendar.app.google/KKL4cx7gWejtrZtj9";
  const googleEmbedUrl =
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL ||
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ244HcB-cfSw_zVmdDe6x1ILxlP_JLme5txmE7qc5lQzQOAXdvkioFYDi3XkS3tCEAXqpYTZ7oX?gv=true";

  const isClient = useIsClient();
  const [viewMode, setViewMode] = useState<"google" | "custom">("google");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const currentDate = useMemo(() => (isClient ? new Date() : null), [isClient]);
  const scheduleDays = useMemo(
    () => (currentDate ? generateRollingSchedule(7, currentDate) : []),
    [currentDate],
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    timezones[0],
  );
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadBookedSlots() {
      try {
        const res = await fetch("/api/schedule");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.bookedSlots)) {
          setBookedSlots(data.bookedSlots);
        }
      } catch {
        // silently fallback
      }
    }
    loadBookedSlots();
    return () => {
      isMounted = false;
    };
  }, []);

  const isSlotBooked = (dayFullDate: string, slotTime: string) => {
    const key = `${dayFullDate.trim()}_${slotTime.trim()}`.toLowerCase();
    return bookedSlots.some((s) => s.trim().toLowerCase() === key);
  };

  // Form State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "confirmed" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<{
    date: string;
    timeSlot: string;
    timezone: string;
    meetUrl: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "E-Commerce Automation Systems",
    notes: "",
  });

  const activeDay = scheduleDays[selectedDayIndex] || scheduleDays[0];

  const handleSlotSelect = (dayIdx: number, slot: string) => {
    const targetDay = scheduleDays[dayIdx];
    if (!targetDay || isSlotBooked(targetDay.fullDate, slot)) return;
    setSelectedDayIndex(dayIdx);
    setSelectedSlot(slot);
    setIsBookingOpen(true);
    setErrorMessage("");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !activeDay || isSlotBooked(activeDay.fullDate, selectedSlot)) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          date: activeDay.fullDate,
          timeSlot: selectedSlot,
          timezone: selectedTimezone,
          service: formData.service,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to schedule appointment.");
      }

      setConfirmedBooking({
        date: activeDay.fullDate,
        timeSlot: selectedSlot,
        timezone: selectedTimezone,
        meetUrl: data.booking.googleMeetUrl,
      });
      // Append booked slot so it is immediately rendered as disabled
      setBookedSlots((prev) => [
        ...prev,
        `${activeDay.fullDate.trim()}_${selectedSlot.trim()}`,
      ]);
      setStatus("confirmed");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Network error. Please try again.",
      );
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!confirmedBooking) return "#";
    const title = encodeURIComponent(
      "30 minutes with AriseStudio Architecture Team",
    );
    const details = encodeURIComponent(
      `Technical Discovery Call with AriseStudio.\nTopic: ${formData.service}\nAttendee: ${formData.name} (${formData.company})${confirmedBooking.meetUrl ? `\nGoogle Meet: ${confirmedBooking.meetUrl}` : ""}`,
    );
    const location = encodeURIComponent(
      confirmedBooking.meetUrl || "Google Meet (Link in confirmation email)",
    );

    try {
      const match = confirmedBooking.timeSlot.match(/(\d+):(\d+)(am|pm)/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        const isPM = match[3].toLowerCase() === "pm";
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        const d = new Date(confirmedBooking.date);
        const tzMatch = confirmedBooking.timezone.match(/UTC([+-]\d+)/i);
        let utcTimestamp: number;
        if (tzMatch) {
          const offsetHours = parseInt(tzMatch[1], 10);
          utcTimestamp = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), hours - offsetHours, mins);
        } else {
          d.setHours(hours, mins, 0, 0);
          utcTimestamp = d.getTime();
        }

        const formatGCal = (dt: Date) =>
          dt
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");
        const dates = `${formatGCal(new Date(utcTimestamp))}/${formatGCal(new Date(utcTimestamp + 30 * 60 * 1000))}`;
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      }
    } catch {
      // fallback if parsing fails
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const currentMonthIdx = currentDate ? currentDate.getMonth() : 0;
  const currentYear = currentDate ? currentDate.getFullYear() : 2026;
  const monthHeader = currentDate
    ? `${monthNames[currentMonthIdx]} ${currentYear}`
    : "";

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-[#09101d]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-3 sm:p-5 relative">
      {/* Sleek Integrated Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-white/[0.06]">
        {/* Host Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#004157] to-[#0a814f] border border-emerald-400/50 flex items-center justify-center text-xs font-mono font-bold text-emerald-300 shrink-0 shadow-sm">
            FS
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Farhan Kabir Sifat</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-400 font-normal">Principal Architect</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Clock className="w-3 h-3 text-emerald-400/80" />
              <span>30 min</span>
              <span>•</span>
              <Video className="w-3 h-3 text-sky-400/80" />
              <span>Google Meet</span>
            </div>
          </div>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Tab Pill */}
          <div className="inline-flex p-0.5 rounded-lg bg-slate-900/90 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setViewMode("google")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === "google"
                  ? "bg-emerald-400 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarIcon className="w-3 h-3" />
              <span>Google Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("custom")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === "custom"
                  ? "bg-emerald-400 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Studio Matrix</span>
            </button>
          </div>

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-900/90 border border-white/[0.08] hover:border-emerald-400/50 text-slate-400 hover:text-white transition-colors"
            title="Open in external Google Calendar tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {viewMode === "google" ? (
        /* Embedded Google Calendar Appointment Schedule (Direct on-site) */
        <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-slate-700/50 shadow-inner">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 gap-2 z-10 min-h-[480px]">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">
                Loading Google Calendar...
              </span>
            </div>
          )}
          <iframe
            src={googleEmbedUrl}
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-[620px] sm:h-[680px] border-0 bg-white"
            title="30 minutes with AriseStudio - Google Calendar Appointment Schedule"
            allow="camera; microphone; fullscreen; clipboard-write"
          />
        </div>
      ) : (
        /* Custom Studio Matrix */
        <div>
          {/* Timezone Selector for Studio Matrix */}
          <div className="mb-4 flex items-center justify-end">
            <div className="flex items-center gap-2 bg-[#09101d] px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-mono text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer pr-2"
              >
                {timezones.map((tz) => (
                  <option
                    key={tz}
                    value={tz}
                    className="bg-[#09101d] text-slate-200"
                  >
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isClient || !currentDate || scheduleDays.length === 0 ? (
            <div className="w-full rounded-3xl bg-[#09101d] border border-white/[0.08] p-12 text-center flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span className="text-sm font-mono">
                Loading available appointment dates...
              </span>
            </div>
          ) : status === "confirmed" && confirmedBooking ? (
        /* Confirmed Success Card */
        <div className="rounded-3xl bg-[#09101d] border border-emerald-500/40 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Confirmed & Verified
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Your 30-Min Architecture Call is Scheduled!
          </h3>

          <p className="text-slate-300 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            We have reserved your slot with an AriseStudio Principal Systems
            Architect. A calendar invitation has been dispatched to{" "}
            <strong>{formData.email}</strong>.
          </p>

          <div className="my-8 max-w-md mx-auto p-5 rounded-2xl bg-[#004157]/30 border border-white/[0.08] text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Date:</span>
              <span className="text-white font-bold">
                {confirmedBooking.date}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Time:</span>
              <span className="text-emerald-400 font-bold">
                {confirmedBooking.timeSlot} (
                {confirmedBooking.timezone.split(" ")[0]})
              </span>
            </div>
            {confirmedBooking.meetUrl ? (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-slate-400">Google Meet Link:</span>
                <a
                  href={confirmedBooking.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 underline break-all flex items-center gap-1 font-semibold"
                >
                  {confirmedBooking.meetUrl}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-slate-400">Video Conference:</span>
                <span className="text-slate-200">
                  Google Meet link is attached directly to your calendar invite.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all text-xs shadow-lg shadow-emerald-500/20"
            >
              <CalendarIcon className="w-4 h-4" />
              Add to Google Calendar
            </a>
            <button
              onClick={() => {
                setStatus("idle");
                setIsBookingOpen(false);
                setSelectedSlot(null);
              }}
              className="px-6 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-xs"
            >
              Schedule Another Call
            </button>
          </div>
        </div>
      ) : (
        /* Calendar & Columns Card */
        <div className="rounded-3xl bg-[#09101d] border border-white/[0.08] shadow-2xl p-6 sm:p-8 lg:p-10 relative">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Select an appointment time
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {monthHeader}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Mini Calendar Widget */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-bold text-white font-mono">
                  {monthHeader}
                </span>
                <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Rolling 7 Days
                </span>
              </div>

              {/* Day Initials */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono text-slate-500 font-semibold">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono">
                {/* Preceding days from previous month */}
                {Array.from(
                  {
                    length: new Date(currentYear, currentMonthIdx, 1).getDay(),
                  },
                  (_, i) => {
                    const prevMonthDays = new Date(
                      currentYear,
                      currentMonthIdx,
                      0,
                    ).getDate();
                    const firstDay = new Date(
                      currentYear,
                      currentMonthIdx,
                      1,
                    ).getDay();
                    const dayNum = prevMonthDays - firstDay + 1 + i;
                    return (
                      <span key={`prev-${i}`} className="p-2 text-slate-700">
                        {dayNum}
                      </span>
                    );
                  },
                )}

                {/* Current month days */}
                {Array.from(
                  {
                    length: new Date(
                      currentYear,
                      currentMonthIdx + 1,
                      0,
                    ).getDate(),
                  },
                  (_, i) => {
                    const dayNum = i + 1;
                    const schedIdx = scheduleDays.findIndex(
                      (sd) =>
                        sd.dateNumber === dayNum &&
                        sd.fullDate.includes(monthNames[currentMonthIdx]),
                    );
                    const isSchedDay = schedIdx !== -1;
                    const isSelected =
                      isSchedDay && selectedDayIndex === schedIdx;
                    const hasSlots =
                      isSchedDay && scheduleDays[schedIdx].slots.length > 0;
                    const isPast = dayNum < currentDate.getDate();

                    if (isSchedDay) {
                      return (
                        <button
                          key={dayNum}
                          onClick={() => setSelectedDayIndex(schedIdx)}
                          disabled={!hasSlots}
                          className={`p-2 rounded-full font-bold transition-all ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-md"
                              : hasSlots
                                ? "bg-slate-800/80 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                                : "text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    }

                    return (
                      <span
                        key={dayNum}
                        className={`p-2 ${isPast ? "text-slate-700" : "text-slate-500"}`}
                      >
                        {dayNum}
                      </span>
                    );
                  },
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Highlighted dates have open slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span>Fridays reserved for maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <span className="w-2 h-[1px] bg-slate-400 transform -rotate-45" />
                  </span>
                  <span>Crossed-out slots are already booked</span>
                </div>
              </div>
            </div>

            {/* Right Days & Pill Slot Columns (Directly matching Enosis / Google Calendar reference) */}
            <div className="lg:col-span-8 overflow-x-auto pb-4">
              <div className="min-w-[620px]">
                {/* Day Headers Row */}
                <div className="grid grid-cols-7 gap-2 pb-4 text-center">
                  {scheduleDays.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    return (
                      <div
                        key={day.dateNumber}
                        className="flex flex-col items-center"
                      >
                        <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                          {day.dayShort}
                        </span>
                        <button
                          onClick={() => setSelectedDayIndex(idx)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105"
                              : "bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                          }`}
                        >
                          {day.dateNumber}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Slots Columns */}
                <div className="grid grid-cols-7 gap-2 pt-2 items-start">
                  {scheduleDays.map((day, dIdx) => (
                    <div key={day.dateNumber} className="space-y-2">
                      {day.slots.length > 0 ? (
                        day.slots.map((slot) => {
                          const isBooked = isSlotBooked(day.fullDate, slot);
                          const isPicked =
                            selectedDayIndex === dIdx && selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => !isBooked && handleSlotSelect(dIdx, slot)}
                              className={`w-full py-2 px-1 text-center rounded-full text-xs font-mono font-medium transition-all duration-150 border ${
                                isBooked
                                  ? "bg-slate-950/60 text-slate-500/70 border-slate-800/40 cursor-not-allowed line-through opacity-50 select-none hover:border-slate-800/40 hover:bg-slate-950/60"
                                  : isPicked
                                    ? "bg-emerald-400 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/30 cursor-pointer"
                                    : "bg-slate-900/90 text-slate-200 border-slate-800 hover:border-emerald-500/50 hover:bg-[#004157]/40 hover:text-white cursor-pointer"
                              }`}
                              title={
                                isBooked
                                  ? `${slot} (Booked - Not Available)`
                                  : `Select ${slot}`
                              }
                            >
                              {slot}
                            </button>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center text-slate-600 font-mono text-sm">
                          —
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Confirmation Slide-In Modal / Panel */}
      {isBookingOpen && status !== "confirmed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#09101d] border border-emerald-500/40 p-6 sm:p-8 shadow-2xl relative text-left">
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-semibold">
                  Confirm 30-Min Discovery Call
                </span>
                <h4 className="text-xl font-bold text-white mt-1">
                  {activeDay.fullDate}
                </h4>
                <p className="text-xs text-emerald-300 font-mono mt-0.5">
                  ⏰ {selectedSlot} ({selectedTimezone.split(" ")[0]})
                </p>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {status === "error" && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Mahir Zaman"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Corporate Email <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="mahir@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="e.g. Apex Commerce"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Discussion Focus
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="E-Commerce Automation Systems">
                      E-Commerce Automation
                    </option>
                    <option value="Custom ERP & CRM Engineering">
                      Custom ERP & CRM
                    </option>
                    <option value="Business Process Automation & RPA">
                      Business Process RPA
                    </option>
                    <option value="24/7 Managed IT Support & DevOps">
                      24/7 Managed IT Support
                    </option>
                    <option value="General Architecture Audit">
                      General Architecture
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brief Project Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Tell us about the bottleneck you want to solve..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Reserving Slot...
                    </>
                  ) : (
                    <>
                      Confirm 30-Min Call
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
