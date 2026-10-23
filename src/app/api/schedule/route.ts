import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { getTursoClient, initTursoSchema } from "@/lib/turso";
import { createGoogleCalendarEvent } from "@/lib/googleCalendar";

const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

function formatTimeRange(timeSlot: string): string {
  const match = (timeSlot || "").match(/(\d+):(\d+)(am|pm)/i);
  if (!match) return timeSlot;
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
  return `${hour}:${pad(min)} – ${endHour}:${pad(endMin)}${endMeridiem.toUpperCase()}`;
}

function generateGoogleCalendarUrl(params: {
  title: string;
  dateStr: string;
  timeSlot: string;
  details: string;
  location: string;
}): string {
  try {
    const parsedDate = new Date(params.dateStr);
    if (isNaN(parsedDate.getTime())) {
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.title)}&details=${encodeURIComponent(params.details)}&location=${encodeURIComponent(params.location)}`;
    }
    const match = params.timeSlot.match(/(\d+):(\d+)(am|pm)/i);
    let startHour = 10;
    let startMin = 0;
    if (match) {
      startHour = parseInt(match[1], 10);
      startMin = parseInt(match[2], 10);
      const meridiem = match[3].toLowerCase();
      if (meridiem === "pm" && startHour < 12) startHour += 12;
      if (meridiem === "am" && startHour === 12) startHour = 0;
    }
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();
    const day = parsedDate.getDate();
    // Default timezone Bangladesh GMT+6 (subtract 6 hours for UTC)
    const startUtc = new Date(Date.UTC(year, month, day, startHour - 6, startMin, 0));
    const endUtc = new Date(startUtc.getTime() + 30 * 60 * 1000);
    const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.title)}&dates=${formatUtc(startUtc)}/${formatUtc(endUtc)}&details=${encodeURIComponent(params.details)}&location=${encodeURIComponent(params.location)}`;
  } catch {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.title)}&details=${encodeURIComponent(params.details)}&location=${encodeURIComponent(params.location)}`;
  }
}

const CDN_BASE = "https://raw.githubusercontent.com/fksifat/AriseStudio_website/main";
const logoLightUrl = `${CDN_BASE}/public/brand/arisestudio-logo.png`;
const logoDarkUrl = `${CDN_BASE}/public/brand/arisestudio-logo-darkmode.png`;
const iconVideoUrl = `${CDN_BASE}/public/email-icons/video-meet.png`;
const iconCalendarUrl = `${CDN_BASE}/public/email-icons/calendar.png`;
const iconGlobeUrl = `${CDN_BASE}/public/email-icons/globe.png`;
const iconCheckUrl = `${CDN_BASE}/public/email-icons/check-circle.png`;
const iconCalendarBtnDarkUrl = `${CDN_BASE}/public/email-icons/calendar-btn-dark.png`;
const iconCalendarBtnLightUrl = `${CDN_BASE}/public/email-icons/calendar-btn.png`;

// shortcut: local JSONL fallback; upgrade to PostgreSQL/Supabase when scaling to multi-region serverless
async function persistSubmission(filename: string, data: Record<string, unknown>) {
  const line = JSON.stringify(data) + "\n";
  try {
    const dir = path.join(process.cwd(), "data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(path.join(dir, filename), line, "utf8");
  } catch {
    try {
      await fs.appendFile(path.join("/tmp", filename), line, "utf8");
    } catch (err) {
      console.error("[Persistence Error]:", err);
    }
  }
}

// shortcut: in-memory map resets on serverless cold starts; upgrade to Upstash Redis for distributed multi-region rate limiting
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((time) => now - time < windowMs);
  if (timestamps.length >= limit) return false;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.every((t) => now - t > 3600000)) rateLimitMap.delete(k);
    }
  }
  return true;
}

function cleanEnvValue(value?: string): string {
  if (!value) return "";
  let v = value.trim();
  while ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, date, timeSlot, timezone, service, notes } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: "Please select an appointment date and time slot." },
        { status: 400 }
      );
    }

    // Check if slot has already been reserved
    try {
      const existingFilePath = path.join(process.cwd(), "data", "bookings.jsonl");
      const existingContent = await fs.readFile(existingFilePath, "utf8");
      const existingLines = existingContent.trim().split("\n").filter(Boolean);
      const isAlreadyBooked = existingLines.some((line) => {
        try {
          const entry = JSON.parse(line);
          return (
            entry.date?.trim().toLowerCase() === String(date).trim().toLowerCase() &&
            entry.timeSlot?.trim().toLowerCase() === String(timeSlot).trim().toLowerCase()
          );
        } catch {
          return false;
        }
      });

      if (isAlreadyBooked) {
        return NextResponse.json(
          { success: false, error: "This appointment slot is already reserved. Please choose an open slot." },
          { status: 409 }
        );
      }
    } catch {
      // file might not exist yet, continue
    }

    // Rate limiting: prevent IP flooding and email bombing
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";

    if (!checkRateLimit(`ip:${clientIp}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too many booking requests from this network. Please wait a few minutes." },
        { status: 429 }
      );
    }

    if (!checkRateLimit(`email:${email.toLowerCase().trim()}`, 2, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too many bookings requested for this email address. Please check your inbox or try again later." },
        { status: 429 }
      );
    }

    // Meeting URL: check notes, generate unique room via Google Calendar API, or use fallback
    const notesStr = typeof notes === "string" ? notes.trim() : "";
    const extractedMeetingUrl = notesStr.match(/https?:\/\/[^\s]+/)?.[0];

    let generatedMeetUrl: string | null = null;
    let calendarEventUrl: string | null = null;
    let gcalNotice: string | undefined = undefined;

    try {
      const gcal = await createGoogleCalendarEvent({
        title: `30-Min Discovery Session | AriseStudio with ${name.trim()}`,
        description: `Technical Discovery Consultation with AriseStudio.\n\nAttendee: ${name.trim()} (${phone.trim()})\nEmail: ${email.trim()}${notesStr ? `\nNotes: ${notesStr}` : ""}\n\nHost: Farhan Kabir Sifat (Principal Systems Architect)`,
        attendeeName: name.trim(),
        attendeeEmail: email.trim(),
        dateStr: date,
        timeSlot,
        timezone,
      });

      if (gcal.success && gcal.meetUrl) {
        generatedMeetUrl = gcal.meetUrl;
        calendarEventUrl = gcal.calendarEventUrl;
        console.log("[Google Meet Created Successfully]:", generatedMeetUrl);
      } else {
        gcalNotice = gcal.error;
        console.warn("[Google Calendar Generation Notice]:", gcal.error);
      }
    } catch (gcalErr) {
      gcalNotice = gcalErr instanceof Error ? gcalErr.message : "Calendar service error";
      console.warn("[Google Calendar Service Notice]:", gcalErr);
    }

    const defaultMeetUrl =
      process.env.GOOGLE_MEET_URL?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_MEET_URL?.trim() ||
      "https://meet.google.com/lookup/arisestudio-discovery";

    const googleMeetUrl = generatedMeetUrl || extractedMeetingUrl || defaultMeetUrl;

    const bookingData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company ? String(company).trim() : "",
      date,
      timeSlot,
      timezone: timezone || "(GMT+06:00) Bangladesh Standard Time",
      service: service ? String(service).trim() : "",
      notes: notesStr,
      googleMeetUrl,
      calendarEventUrl,
      bookedAt: new Date().toISOString()
    };

    console.log("[AriseStudio Call Scheduled]:", bookingData);

    // Persist to Turso Cloud SQLite (survives Vercel deploys & cold starts)
    const turso = getTursoClient();
    if (turso) {
      try {
        await initTursoSchema();
        await turso.execute({
          sql: `
            INSERT INTO bookings (date, timeSlot, name, email, phone, company, timezone, service, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date, timeSlot) DO UPDATE SET
              name = excluded.name,
              email = excluded.email,
              phone = excluded.phone,
              company = excluded.company,
              notes = excluded.notes;
          `,
          args: [
            bookingData.date,
            bookingData.timeSlot,
            bookingData.name,
            bookingData.email,
            bookingData.phone,
            bookingData.company,
            bookingData.timezone,
            bookingData.service,
            bookingData.notes,
          ],
        });
      } catch (tursoErr) {
        console.error("[Turso Persistence Error]:", tursoErr);
      }
    }

    await persistSubmission("bookings.jsonl", bookingData);

    // Optional email dispatch via SMTP
    const smtpHost = cleanEnvValue(process.env.SMTP_HOST);
    const smtpPort = process.env.SMTP_PORT ? parseInt(cleanEnvValue(process.env.SMTP_PORT), 10) : 587;
    const smtpUser = cleanEnvValue(process.env.SMTP_USER);
    const smtpPass = cleanEnvValue(process.env.SMTP_PASS);
    const recipient = cleanEnvValue(process.env.CONTACT_NOTIFICATION_EMAIL) || "contact@arisestudio.com";

    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const timeRangeStr = formatTimeRange(bookingData.timeSlot);
        const hasNotes = Boolean(bookingData.notes && bookingData.notes.length > 0 && bookingData.notes !== "No additional notes provided");
        const gCalUrl = generateGoogleCalendarUrl({
          title: "30m Architecture Discovery | AriseStudio",
          dateStr: bookingData.date,
          timeSlot: bookingData.timeSlot,
          details: `30-Minute Architecture Discovery Session with AriseStudio.\n\nAttendee: ${bookingData.name} (${bookingData.phone})\nEmail: ${bookingData.email}${hasNotes ? `\nNotes: ${bookingData.notes}` : ""}\n\nGoogle Meet: ${googleMeetUrl}`,
          location: googleMeetUrl,
        });

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Appointment Confirmation · AriseStudio</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #030712 !important; }
      .card-bg { background-color: #0b0f19 !important; border-color: #1e293b !important; }
      .header-bg { background-color: #0b0f19 !important; border-color: #1e293b !important; }
      .highlight-box { background-color: #111827 !important; border-color: #1f2937 !important; }
      .border-inner { border-color: #1f2937 !important; }
      .footer-bg { background-color: #080c16 !important; border-color: #1e293b !important; }
      .text-title { color: #ffffff !important; }
      .text-sub { color: #94a3b8 !important; }
      .text-body { color: #cbd5e1 !important; }
      .text-strong { color: #f8fafc !important; }
      .text-muted { color: #64748b !important; }
      .border-divider { border-color: #1e293b !important; }
      .badge-box { background-color: rgba(16, 185, 129, 0.12) !important; border-color: rgba(16, 185, 129, 0.3) !important; color: #34d399 !important; }
      .gcal-btn { background-color: #1e293b !important; border-color: #334155 !important; color: #f1f5f9 !important; }
      .logo-light { display: none !important; }
      .logo-dark { display: block !important; margin: 0 auto !important; }
      .gcal-icon-light { display: none !important; }
      .gcal-icon-dark { display: inline-block !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="body-bg" style="background-color: #f1f5f9; padding: 20px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card-bg" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Brand Logo Header (Centered & Compact) -->
          <tr>
            <td class="header-bg" align="center" style="padding: 20px 20px 16px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; text-align: center;">
              <!-- Default Light Logo -->
              <div class="logo-light" style="display: block; text-align: center;">
                <img src="${logoLightUrl}" alt="AriseStudio" width="148" height="44" style="display: block; margin: 0 auto; width: 148px; max-width: 148px; height: auto; border: 0;" />
              </div>
              <!-- Dark Mode Logo -->
              <!--[if !mso]><!-->
              <div class="logo-dark" style="display: none; text-align: center;">
                <img src="${logoDarkUrl}" alt="AriseStudio" width="148" height="44" style="display: block; margin: 0 auto; width: 148px; max-width: 148px; height: auto; border: 0;" />
              </div>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Main Body (Compact) -->
          <tr>
            <td style="padding: 22px 24px 18px 24px;">
              <!-- Status Pill -->
              <div class="badge-box" style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; color: #059669; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px;">
                <img src="${iconCheckUrl}" width="12" height="12" style="vertical-align: -1px; margin-right: 5px; display: inline-block; border: 0;" alt="" />
                30-Minute Consultation Confirmed
              </div>

              <!-- Main Heading -->
              <h1 class="text-title" style="color: #0f172a; font-size: 19px; font-weight: 700; line-height: 1.3; margin: 0 0 6px 0;">
                30 minutes with AriseStudio
              </h1>
              <p class="text-sub" style="color: #475569; font-size: 13.5px; line-height: 1.45; margin: 0 0 16px 0;">
                Hi ${escapeHtml(bookingData.name)}, your discovery session has been scheduled with our Principal Systems Architect. Here are your meeting details:
              </p>

              <!-- Session Highlight Card (Compact) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="highlight-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <!-- Date & Time Row -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 6px;">
                      <tr>
                        <td width="22" valign="middle" style="vertical-align: middle; padding-right: 8px;">
                          <img src="${iconCalendarUrl}" width="15" height="15" style="display: block; width: 15px; height: 15px; border: 0;" alt="" />
                        </td>
                        <td valign="middle" style="vertical-align: middle;">
                          <span class="text-strong" style="color: #0f172a; font-size: 14px; font-weight: 600;">
                            ${escapeHtml(bookingData.date)} &nbsp;·&nbsp; ${timeRangeStr}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Timezone Row -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                      <tr>
                        <td width="22" valign="middle" style="vertical-align: middle; padding-right: 8px;">
                          <img src="${iconGlobeUrl}" width="15" height="15" style="display: block; width: 15px; height: 15px; border: 0;" alt="" />
                        </td>
                        <td valign="middle" style="vertical-align: middle;">
                          <span class="text-muted" style="color: #64748b; font-size: 11.5px; font-family: monospace;">
                            ${escapeHtml(bookingData.timezone)}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Host Row -->
                    <div class="border-inner" style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 12.5px;">
                      <span class="text-muted" style="color: #64748b; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">Host</span>
                      <strong class="text-strong" style="color: #0f172a;">Farhan Kabir Sifat</strong> &nbsp;·&nbsp; <span class="text-sub" style="color: #475569;">Principal Systems Architect</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Google Meet CTA Box (Compact) -->
              <div style="text-align: center; margin: 18px 0 14px 0;">
                <a href="${encodeURI(googleMeetUrl)}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; box-sizing: border-box; background-color: #10b981; color: #022c22; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; padding: 11px 18px; border-radius: 8px; letter-spacing: 0.01em;">
                  <img src="${iconVideoUrl}" width="16" height="16" style="vertical-align: -2px; display: inline-block; margin-right: 6px; border: 0;" alt="" />
                  Join with Google Meet
                </a>
                <p class="text-muted" style="margin: 6px 0 0 0; font-size: 11.5px; color: #64748b; word-break: break-all; text-align: center;">
                  Direct link: <a href="${encodeURI(googleMeetUrl)}" style="color: #0284c7; text-decoration: underline;">${escapeHtml(googleMeetUrl)}</a>
                </p>
                <div style="margin-top: 10px; text-align: center;">
                  <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="gcal-btn" style="display: inline-block; color: #0f172a; background-color: #ffffff; border: 1px solid #cbd5e1; font-size: 12px; font-weight: 600; text-decoration: none; padding: 7px 14px; border-radius: 6px;">
                    <span class="gcal-icon-light" style="display: inline-block; vertical-align: -2px; margin-right: 5px;">
                      <img src="${iconCalendarBtnDarkUrl}" width="13" height="13" style="display: inline-block; vertical-align: middle; border: 0;" alt="" />
                    </span>
                    <!--[if !mso]><!-->
                    <span class="gcal-icon-dark" style="display: none; vertical-align: -2px; margin-right: 5px;">
                      <img src="${iconCalendarBtnLightUrl}" width="13" height="13" style="display: inline-block; vertical-align: middle; border: 0;" alt="" />
                    </span>
                    <!--<![endif]-->
                    Add to Google Calendar
                  </a>
                </div>
              </div>

              <!-- Reservation Details Table (Compact) -->
              <div class="border-divider" style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 16px;">
                <div class="text-muted" style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px;">
                  Reservation Details
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 12.5px;">
                  <tr>
                    <td class="text-muted" style="padding: 4px 0; color: #64748b; width: 110px;">Full Name</td>
                    <td class="text-strong" style="padding: 4px 0; color: #0f172a; font-weight: 600;">${escapeHtml(bookingData.name)}</td>
                  </tr>
                  <tr>
                    <td class="text-muted" style="padding: 4px 0; color: #64748b;">Email Address</td>
                    <td style="padding: 4px 0; font-weight: 500;">
                      <a href="mailto:${encodeURIComponent(bookingData.email)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(bookingData.email)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-muted" style="padding: 4px 0; color: #64748b;">Phone Number</td>
                    <td style="padding: 4px 0; font-weight: 500;">
                      <a href="tel:${escapeHtml(bookingData.phone)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(bookingData.phone)}</a>
                    </td>
                  </tr>
                  ${hasNotes ? `
                  <tr>
                    <td class="text-muted" style="padding: 4px 0; color: #64748b; vertical-align: top;">Notes</td>
                    <td class="text-body" style="padding: 4px 0; color: #334155; font-weight: 400; line-height: 1.4; white-space: pre-wrap;">${escapeHtml(bookingData.notes)}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer (Compact) -->
          <tr>
            <td class="footer-bg" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center;">
              <p class="text-muted" style="margin: 0 0 3px 0; font-size: 11.5px; color: #64748b; line-height: 1.4;">
                Need to reschedule or update details? Simply reply directly to this email or reach us at <a href="mailto:contact@arisestudio.com" style="color: #0284c7; text-decoration: none;">contact@arisestudio.com</a>.
              </p>
              <p style="margin: 0; font-size: 10.5px; color: #94a3b8;">
                © ${new Date().getFullYear()} AriseStudio · Architecture & Cloud Engineering
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        await transporter.sendMail({
          from: `"AriseStudio Schedule" <${smtpUser}>`,
          to: recipient,
          replyTo: bookingData.email,
          subject: `[New Appointment] 30m with ${bookingData.name.replace(/[\r\n]/g, " ")} - ${bookingData.date} (${timeRangeStr})`,
          html: htmlContent,
        });

        // Also send confirmation copy to the client
        await transporter.sendMail({
          from: `"AriseStudio Appointments" <${smtpUser}>`,
          to: bookingData.email,
          subject: `Confirmed: 30 minutes with AriseStudio on ${bookingData.date} (${timeRangeStr})`,
          html: htmlContent,
        });

        emailSent = true;
      } catch (mailError) {
        console.error("[Schedule Mail Error]:", mailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Appointment confirmed successfully.",
      emailSent,
      booking: {
        ...bookingData,
        gcalStatus: generatedMeetUrl ? "created" : "fallback",
        gcalNotice: generatedMeetUrl ? undefined : gcalNotice,
      }
    });
  } catch (error) {
    console.error("[Schedule API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to schedule appointment. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookedSlots: string[] = [];

    // 1. Query Turso Cloud SQLite if configured
    const turso = getTursoClient();
    if (turso) {
      try {
        await initTursoSchema();
        const result = await turso.execute(
          "SELECT date, timeSlot FROM bookings ORDER BY id DESC"
        );
        for (const row of result.rows) {
          if (row.date && row.timeSlot) {
            bookedSlots.push(`${row.date}_${row.timeSlot}`);
          }
        }
        if (bookedSlots.length > 0) {
          return NextResponse.json({
            success: true,
            bookedSlots: Array.from(new Set(bookedSlots)),
            source: "turso",
          });
        }
      } catch (tursoErr) {
        console.error("[Turso Fetch Error]:", tursoErr);
      }
    }

    // 2. Fallback to local files
    const primaryPath = path.join(process.cwd(), "data", "bookings.jsonl");
    const tmpPath = path.join("/tmp", "bookings.jsonl");
    let content = "";
    try {
      content = await fs.readFile(primaryPath, "utf8");
    } catch {
      try {
        content = await fs.readFile(tmpPath, "utf8");
      } catch {
        content = "";
      }
    }
    const lines = content.trim().split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.date && parsed.timeSlot) {
          bookedSlots.push(`${parsed.date}_${parsed.timeSlot}`);
        }
      } catch {
        // ignore malformed line
      }
    }
    return NextResponse.json({
      success: true,
      bookedSlots: Array.from(new Set(bookedSlots)),
      source: "local",
    });
  } catch {
    return NextResponse.json({ success: true, bookedSlots: [] });
  }
}

