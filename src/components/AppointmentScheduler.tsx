"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  Video,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  Globe,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Lock,
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
  6: ["10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"], // Saturday
};

const dayShortNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
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

  const isClient = useIsClient();
  const currentDate = useMemo(() => (isClient ? new Date() : null), [isClient]);
  const [scheduleRefDate, setScheduleRefDate] = useState<Date | null>(null);
  const [viewMonthState, setViewMonthState] = useState<number | null>(null);
  const [viewYearState, setViewYearState] = useState<number | null>(null);

  const activeRefDate = useMemo(
    () => scheduleRefDate || currentDate,
    [scheduleRefDate, currentDate],
  );
  const viewMonth =
    viewMonthState ?? (activeRefDate ? activeRefDate.getMonth() : 9);
  const viewYear =
    viewYearState ?? (activeRefDate ? activeRefDate.getFullYear() : 2026);

  const scheduleDays = useMemo(
    () => (activeRefDate ? generateRollingSchedule(7, activeRefDate) : []),
    [activeRefDate],
  );

  const isPrevMonthDisabled = useMemo(() => {
    if (!currentDate) return true;
    const currentY = currentDate.getFullYear();
    const currentM = currentDate.getMonth();
    return (
      viewYear < currentY || (viewYear === currentY && viewMonth <= currentM)
    );
  }, [currentDate, viewYear, viewMonth]);

  const isPrevWeekDisabled = useMemo(() => {
    if (!currentDate) return true;
    const base = scheduleRefDate || currentDate;
    const todayMidnight = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    ).getTime();
    const baseMidnight = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
    ).getTime();
    return baseMidnight <= todayMidnight;
  }, [currentDate, scheduleRefDate]);

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonthState(11);
      setViewYearState(viewYear - 1);
    } else {
      setViewMonthState(viewMonth - 1);
      setViewYearState(viewYear);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonthState(0);
      setViewYearState(viewYear + 1);
    } else {
      setViewMonthState(viewMonth + 1);
      setViewYearState(viewYear);
    }
  };

  const handlePrevWeek = () => {
    if (isPrevWeekDisabled || !currentDate) return;
    const base = scheduleRefDate || currentDate;
    const newRef = new Date(base);
    newRef.setDate(base.getDate() - 7);
    const todayMidnight = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    if (newRef < todayMidnight) {
      newRef.setTime(todayMidnight.getTime());
    }
    setScheduleRefDate(newRef);
    setViewYearState(newRef.getFullYear());
    setViewMonthState(newRef.getMonth());
    setSelectedDayIndex(0);
    setSelectedSlot(null);
  };

  const handleNextWeek = () => {
    if (!currentDate) return;
    const base = scheduleRefDate || currentDate;
    const newRef = new Date(base);
    newRef.setDate(base.getDate() + 7);
    setScheduleRefDate(newRef);
    setViewYearState(newRef.getFullYear());
    setViewMonthState(newRef.getMonth());
    setSelectedDayIndex(0);
    setSelectedSlot(null);
  };

  const handleCalendarDayClick = (
    dayNum: number,
    monthIdx: number,
    yearNum: number,
  ) => {
    if (!currentDate) return;
    const targetDate = new Date(yearNum, monthIdx, dayNum);
    const todayMidnight = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    if (targetDate < todayMidnight) return;

    setScheduleRefDate(targetDate);
    setViewYearState(yearNum);
    setViewMonthState(monthIdx);
    setSelectedDayIndex(0);
    setSelectedSlot(null);
  };

  const dateRangeLabel = useMemo(() => {
    if (!scheduleDays || scheduleDays.length === 0) return "";
    const first = scheduleDays[0];
    const last = scheduleDays[scheduleDays.length - 1];
    const firstParts = first.fullDate.split(", ");
    const lastParts = last.fullDate.split(", ");
    return `${firstParts[1]} – ${lastParts[1]}`;
  }, [scheduleDays]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    timezones[0],
  );
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadBookedSlots() {
      let localSlots: string[] = [];
      try {
        const cached = localStorage.getItem("arise_booked_slots");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            localSlots = parsed;
            if (isMounted) {
              setBookedSlots(parsed);
            }
          }
        }
      } catch {
        // ignore localStorage access error
      }

      try {
        const res = await fetch("/api/schedule");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.bookedSlots)) {
          const merged = Array.from(new Set([...localSlots, ...data.bookedSlots]));
          setBookedSlots(merged);
          try {
            localStorage.setItem("arise_booked_slots", JSON.stringify(merged));
          } catch {
            // ignore
          }
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
    phone: "",
    notes: "",
  });

  const activeDay = scheduleDays[selectedDayIndex] || scheduleDays[0];

  const formattedSlotRange = useMemo(() => {
    if (!selectedSlot) return "";
    const match = selectedSlot.match(/(\d+):(\d+)(am|pm)/i);
    if (!match) return selectedSlot;
    const hour = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const meridiem = match[3].toLowerCase();

    let endMin = min + 30;
    let endHour = hour;
    let endMeridiem = meridiem;

    if (endMin >= 60) {
      endMin -= 60;
      endHour += 1;
      if (endHour === 12 && meridiem === "am") endMeridiem = "pm";
      else if (endHour === 12 && meridiem === "pm") endMeridiem = "am";
      else if (endHour > 12) endHour = 1;
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${hour}:${pad(min)}`;
    const endStr = `${endHour}:${pad(endMin)}${endMeridiem}`;

    return `${startStr} – ${endStr}`;
  }, [selectedSlot]);

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
          phone: formData.phone,
          date: activeDay.fullDate,
          timeSlot: selectedSlot,
          timezone: selectedTimezone,
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
      // Append booked slot so it is immediately rendered as disabled and persisted
      const newSlotKey = `${activeDay.fullDate.trim()}_${selectedSlot.trim()}`;
      setBookedSlots((prev) => {
        const updated = Array.from(new Set([...prev, newSlotKey]));
        try {
          localStorage.setItem("arise_booked_slots", JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
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
      `Technical Discovery Call with AriseStudio.\nAttendee: ${formData.name} (${formData.phone})\nEmail: ${formData.email}${confirmedBooking.meetUrl ? `\nGoogle Meet: ${confirmedBooking.meetUrl}` : ""}`,
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
        const tzMatch = confirmedBooking.timezone.match(/(?:GMT|UTC)\s*([+-]\d+)/i);
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

  const monthHeader = `${monthNames[viewMonth]} ${viewYear}`;

  return (
    <div className="w-full max-w-7xl mx-auto rounded-3xl bg-[#09101d]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-5 sm:p-7 relative">
      {/* Sleek Integrated Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06]">
        {/* Host Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#004157] to-[#0a814f] border border-emerald-400/50 flex items-center justify-center text-xs font-mono font-bold text-emerald-300 shrink-0 shadow-sm">
            FS
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Farhan Kabir Sifat</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-400 font-normal">Principal Architect</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono mt-0.5">
              <Clock className="w-3 h-3 text-emerald-400/80" />
              <span>30 min</span>
              <span>•</span>
              <Video className="w-3 h-3 text-sky-400/80" />
              <span>Google Meet</span>
            </div>
          </div>
        </div>

        {/* Timezone Selector & Open/Extend Calendar Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs font-mono text-slate-300">
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
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

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/20 text-xs font-medium text-emerald-300 hover:text-white transition-all shadow-sm"
            title="Open full Google Calendar in new tab"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono hidden sm:inline">Open Calendar</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80" />
          </a>
        </div>
      </div>

      {!isClient || !currentDate || scheduleDays.length === 0 ? (
        <div className="w-full py-16 sm:py-20 text-center flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-sm font-mono">
            Loading available appointment dates...
          </span>
        </div>
      ) : status === "confirmed" && confirmedBooking ? (
        /* Confirmed Success View (No inner nested card) */
        <div className="py-6 sm:py-10 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
        /* Main Schedule Section - Single Card Interface */
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-white/[0.06]">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Select an appointment time
            </h3>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {dateRangeLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  disabled={isPrevWeekDisabled}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white hover:border-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Previous 7 Days"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white hover:border-emerald-500/40 transition-all"
                  title="Next 7 Days"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start">
            {/* Left Mini Calendar - Clean & Borderless (No inner card) */}
            <div className="w-full lg:w-[245px] shrink-0 space-y-4 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] lg:pr-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-bold text-white font-mono">
                  {monthHeader}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isPrevMonthDisabled}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    title="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
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
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
                {/* Preceding days from previous month */}
                {Array.from(
                  {
                    length: new Date(viewYear, viewMonth, 1).getDay(),
                  },
                  (_, i) => {
                    const prevMonthDays = new Date(
                      viewYear,
                      viewMonth,
                      0,
                    ).getDate();
                    const firstDay = new Date(
                      viewYear,
                      viewMonth,
                      1,
                    ).getDay();
                    const dayNum = prevMonthDays - firstDay + 1 + i;
                    return (
                      <span
                        key={`prev-${i}`}
                        className="w-7 h-7 mx-auto flex items-center justify-center text-slate-700"
                      >
                        {dayNum}
                      </span>
                    );
                  },
                )}

                {/* Current month days */}
                {Array.from(
                  {
                    length: new Date(
                      viewYear,
                      viewMonth + 1,
                      0,
                    ).getDate(),
                  },
                  (_, i) => {
                    const dayNum = i + 1;
                    const targetDate = new Date(viewYear, viewMonth, dayNum);
                    const todayMidnight = currentDate
                      ? new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          currentDate.getDate(),
                        )
                      : null;
                    const isPast = todayMidnight ? targetDate < todayMidnight : false;

                    const schedIdx = scheduleDays.findIndex((sd) => {
                      const d = new Date(sd.fullDate);
                      return (
                        d.getDate() === dayNum &&
                        d.getMonth() === viewMonth &&
                        d.getFullYear() === viewYear
                      );
                    });
                    const isSchedDay = schedIdx !== -1;
                    const isSelected =
                      isSchedDay && selectedDayIndex === schedIdx;
                    const dayOfWeek = targetDate.getDay();
                    const isClosed = defaultSlotsByWeekday[dayOfWeek]?.length === 0;

                    if (isPast) {
                      return (
                        <span
                          key={dayNum}
                          className="w-7 h-7 mx-auto flex items-center justify-center text-slate-700 cursor-not-allowed"
                        >
                          {dayNum}
                        </span>
                      );
                    }

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        disabled={isClosed}
                        onClick={() => {
                          if (isSchedDay) {
                            setSelectedDayIndex(schedIdx);
                          } else {
                            handleCalendarDayClick(dayNum, viewMonth, viewYear);
                          }
                        }}
                        className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full font-bold transition-all ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-md scale-105"
                            : isSchedDay
                              ? "bg-slate-800/80 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                              : isClosed
                                ? "text-slate-600 cursor-not-allowed"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                        }`}
                        title={
                          isClosed
                            ? "Studio closed (Maintenance)"
                            : `Select ${monthNames[viewMonth]} ${dayNum}`
                        }
                      >
                        {dayNum}
                      </button>
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
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Locked slots are already booked</span>
                </div>
              </div>
            </div>

            {/* Right Days & Pill Slot Columns */}
            <div className="flex-1 w-full min-w-0 overflow-x-auto lg:overflow-x-visible pb-2">
              <div className="min-w-[560px] lg:min-w-0">
                {/* Day Headers Row */}
                <div className="grid grid-cols-7 gap-2 sm:gap-2.5 pb-4 text-center">
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
                <div className="grid grid-cols-7 gap-2 sm:gap-2.5 pt-2 items-start">
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
                              className={`w-full py-2 px-1 text-center rounded-xl sm:rounded-full text-xs font-mono font-medium transition-all duration-150 border flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                isBooked
                                  ? "bg-slate-950/50 text-slate-500 border-slate-800/60 select-none cursor-not-allowed disabled:cursor-not-allowed hover:border-slate-800/60 hover:bg-slate-950/50"
                                  : isPicked
                                    ? "bg-emerald-400 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/30 cursor-pointer"
                                    : "bg-slate-900/90 text-slate-200 border-slate-800 hover:border-emerald-500/50 hover:bg-[#004157]/40 hover:text-white cursor-pointer"
                              }`}
                              title={
                                isBooked
                                  ? `${slot} (Booked — Reserved)`
                                  : `Select ${slot}`
                              }
                            >
                              {isBooked && (
                                <Lock className="w-3 h-3 text-slate-500/80 shrink-0" />
                              )}
                              <span>{slot}</span>
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

      {/* Confirmation Slide-In Modal / Panel rendered via Portal to escape backdrop-filter */}
      {isBookingOpen && status !== "confirmed" && isClient && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#09101d] border border-white/[0.12] p-6 sm:p-8 shadow-2xl relative text-left animate-in zoom-in-95 duration-150">
            {/* Header matching Google Calendar style */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  30 minutes with AriseStudio
                </h3>
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono font-medium">
                  <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {activeDay ? activeDay.fullDate.replace(/,\s*\d{4}$/, "") : ""} · {formattedSlotRange}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    {selectedTimezone.includes("Bangladesh")
                      ? "(GMT+06:00) Bangladesh Standard Time"
                      : selectedTimezone}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
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
                  Email Address <span className="text-emerald-400">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+880 1700-000000"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meeting Location / Google Meet
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  <Video className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google Meet video conference link will be attached to your calendar invite</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Notes or Custom Meeting Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add notes, questions, or your preferred Zoom link..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:outline-none"
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
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm 30-Min Call</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
