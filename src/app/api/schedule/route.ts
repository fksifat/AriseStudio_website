import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { getTursoClient, initTursoSchema } from "@/lib/turso";

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

async function loadEmailAttachments() {
  const assets = [
    { filename: "arise-logo-dark.png", rel: "public/brand/arisestudio-logo-darkmode.png", cid: "arise-logo-dark" },
    { filename: "arise-logo-light.png", rel: "public/brand/arisestudio-logo.png", cid: "arise-logo-light" },
    { filename: "video-meet.png", rel: "public/email-icons/video-meet.png", cid: "icon-video" },
    { filename: "calendar.png", rel: "public/email-icons/calendar.png", cid: "icon-calendar" },
    { filename: "globe.png", rel: "public/email-icons/globe.png", cid: "icon-globe" },
    { filename: "check-circle.png", rel: "public/email-icons/check-circle.png", cid: "icon-check" },
    { filename: "calendar-btn.png", rel: "public/email-icons/calendar-btn.png", cid: "icon-calendar-btn" },
    { filename: "calendar-btn-dark.png", rel: "public/email-icons/calendar-btn-dark.png", cid: "icon-calendar-btn-dark" },
  ];

  const attachments: { filename: string; content: Buffer; cid: string }[] = [];

  for (const asset of assets) {
    try {
      const fullPath = path.join(process.cwd(), asset.rel);
      const content = await fs.readFile(fullPath);
      attachments.push({
        filename: asset.filename,
        content,
        cid: asset.cid,
      });
    } catch (err) {
      console.warn(`[Email Attachment]: Could not read ${asset.rel}`, err);
    }
  }

  return attachments;
}

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

    // Meeting URL: check if user provided one in notes, or use configured Google Meet room
    const notesStr = typeof notes === "string" ? notes.trim() : "";
    const extractedMeetingUrl = notesStr.match(/https?:\/\/[^\s]+/)?.[0];
    const defaultMeetUrl =
      process.env.GOOGLE_MEET_URL?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_MEET_URL?.trim() ||
      "https://meet.google.com/lookup/arisestudio-discovery";
    const googleMeetUrl = extractedMeetingUrl || defaultMeetUrl;

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
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || "contact@arisestudio.com";

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
    /* Dark Mode (Default / Base) */
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
      .logo-dark-wrapper { display: block !important; }
      .logo-light-wrapper { display: none !important; }
      .gcal-icon-dark { display: inline-block !important; }
      .gcal-icon-light { display: none !important; }
    }
    /* Light Mode */
    @media (prefers-color-scheme: light) {
      .body-bg { background-color: #f1f5f9 !important; }
      .card-bg { background-color: #ffffff !important; border-color: #e2e8f0 !important; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important; }
      .header-bg { background-color: #ffffff !important; border-color: #f1f5f9 !important; }
      .highlight-box { background-color: #f8fafc !important; border-color: #e2e8f0 !important; }
      .border-inner { border-color: #e2e8f0 !important; }
      .footer-bg { background-color: #f8fafc !important; border-color: #e2e8f0 !important; }
      .text-title { color: #0f172a !important; }
      .text-sub { color: #475569 !important; }
      .text-body { color: #334155 !important; }
      .text-strong { color: #0f172a !important; }
      .text-muted { color: #64748b !important; }
      .border-divider { border-color: #e2e8f0 !important; }
      .badge-box { background-color: #ecfdf5 !important; border-color: #a7f3d0 !important; color: #059669 !important; }
      .gcal-btn { background-color: #f8fafc !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
      .logo-dark-wrapper { display: none !important; }
      .logo-light-wrapper { display: block !important; }
      .gcal-icon-dark { display: none !important; }
      .gcal-icon-light { display: inline-block !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="body-bg" style="background-color: #030712; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card-bg" style="max-width: 560px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);">
          
          <!-- Brand Logo Header (Centered) -->
          <tr>
            <td class="header-bg" align="center" style="padding: 32px 24px 24px 24px; background-color: #0b0f19; border-bottom: 1px solid #1e293b; text-align: center;">
              <!-- Dark Mode Logo -->
              <div class="logo-dark-wrapper" style="display: block; text-align: center;">
                <img src="cid:arise-logo-dark" alt="AriseStudio" width="170" height="51" style="display: block; margin: 0 auto; width: 170px; max-width: 170px; height: auto; border: 0;" />
              </div>
              <!-- Light Mode Logo -->
              <!--[if !mso]><!-->
              <div class="logo-light-wrapper" style="display: none; text-align: center;">
                <img src="cid:arise-logo-light" alt="AriseStudio" width="170" height="51" style="display: block; margin: 0 auto; width: 170px; max-width: 170px; height: auto; border: 0;" />
              </div>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              <!-- Status Pill (with clean vector checkmark icon) -->
              <div class="badge-box" style="display: inline-block; padding: 5px 12px; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; color: #34d399; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
                <img src="cid:icon-check" width="12" height="12" style="vertical-align: -1px; margin-right: 5px; display: inline-block; border: 0;" alt="" />
                30-Minute Consultation Confirmed
              </div>

              <!-- Main Heading -->
              <h1 class="text-title" style="color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3; margin: 0 0 8px 0;">
                30 minutes with AriseStudio
              </h1>
              <p class="text-sub" style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
                Hi ${escapeHtml(bookingData.name)}, your discovery session has been scheduled with our Principal Systems Architect. Here are your meeting details:
              </p>

              <!-- Session Highlight Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="highlight-box" style="background-color: #111827; border: 1px solid #1f2937; border-radius: 14px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 20px;">
                    <!-- Date & Time Row with crisp Calendar icon -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                      <tr>
                        <td width="24" valign="middle" style="vertical-align: middle; padding-right: 10px;">
                          <img src="cid:icon-calendar" width="16" height="16" style="display: block; width: 16px; height: 16px; border: 0;" alt="" />
                        </td>
                        <td valign="middle" style="vertical-align: middle;">
                          <span class="text-strong" style="color: #ffffff; font-size: 15px; font-weight: 600;">
                            ${escapeHtml(bookingData.date)} &nbsp;·&nbsp; ${timeRangeStr}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Timezone Row with crisp Globe icon -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="24" valign="middle" style="vertical-align: middle; padding-right: 10px;">
                          <img src="cid:icon-globe" width="16" height="16" style="display: block; width: 16px; height: 16px; border: 0;" alt="" />
                        </td>
                        <td valign="middle" style="vertical-align: middle;">
                          <span class="text-muted" style="color: #94a3b8; font-size: 12px; font-family: monospace;">
                            ${escapeHtml(bookingData.timezone)}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Host Row -->
                    <div class="border-inner" style="border-top: 1px solid #1f2937; padding-top: 12px; font-size: 13px;">
                      <span class="text-muted" style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">Host</span>
                      <strong class="text-strong" style="color: #f1f5f9;">Farhan Kabir Sifat</strong> &nbsp;·&nbsp; <span class="text-sub" style="color: #94a3b8;">Principal Systems Architect</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Google Meet CTA Box -->
              <div style="text-align: center; margin: 26px 0 20px 0;">
                <a href="${encodeURI(googleMeetUrl)}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; box-sizing: border-box; background-color: #10b981; color: #022c22; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 11px; letter-spacing: 0.01em;">
                  <img src="cid:icon-video" width="17" height="17" style="vertical-align: -3px; display: inline-block; margin-right: 8px; border: 0;" alt="" />
                  Join with Google Meet
                </a>
                <p class="text-muted" style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8; word-break: break-all; text-align: center;">
                  Direct link: <a href="${encodeURI(googleMeetUrl)}" style="color: #0284c7; text-decoration: underline;">${escapeHtml(googleMeetUrl)}</a>
                </p>
                <div style="margin-top: 16px; text-align: center;">
                  <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="gcal-btn" style="display: inline-block; color: #e2e8f0; background-color: #1e293b; border: 1px solid #334155; font-size: 13px; font-weight: 600; text-decoration: none; padding: 9px 18px; border-radius: 8px;">
                    <span class="gcal-icon-dark" style="display: inline-block; vertical-align: -2px; margin-right: 6px;">
                      <img src="cid:icon-calendar-btn" width="14" height="14" style="display: inline-block; vertical-align: middle; border: 0;" alt="" />
                    </span>
                    <!--[if !mso]><!-->
                    <span class="gcal-icon-light" style="display: none; vertical-align: -2px; margin-right: 6px;">
                      <img src="cid:icon-calendar-btn-dark" width="14" height="14" style="display: inline-block; vertical-align: middle; border: 0;" alt="" />
                    </span>
                    <!--<![endif]-->
                    Add to Google Calendar
                  </a>
                </div>
              </div>

              <!-- Reservation Details Table -->
              <div class="border-divider" style="border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 24px;">
                <div class="text-muted" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px;">
                  Reservation Details
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                  <tr>
                    <td class="text-muted" style="padding: 7px 0; color: #94a3b8; width: 120px;">Full Name</td>
                    <td class="text-strong" style="padding: 7px 0; color: #f8fafc; font-weight: 500;">${escapeHtml(bookingData.name)}</td>
                  </tr>
                  <tr>
                    <td class="text-muted" style="padding: 7px 0; color: #94a3b8;">Email Address</td>
                    <td style="padding: 7px 0; font-weight: 500;">
                      <a href="mailto:${encodeURIComponent(bookingData.email)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(bookingData.email)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-muted" style="padding: 7px 0; color: #94a3b8;">Phone Number</td>
                    <td style="padding: 7px 0; font-weight: 500;">
                      <a href="tel:${escapeHtml(bookingData.phone)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(bookingData.phone)}</a>
                    </td>
                  </tr>
                  ${hasNotes ? `
                  <tr>
                    <td class="text-muted" style="padding: 7px 0; color: #94a3b8; vertical-align: top;">Notes</td>
                    <td class="text-body" style="padding: 7px 0; color: #cbd5e1; font-weight: 400; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(bookingData.notes)}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-bg" style="background-color: #080c16; border-top: 1px solid #1e293b; padding: 20px 32px; text-align: center;">
              <p class="text-muted" style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                Need to reschedule or update details? Simply reply directly to this email or reach us at <a href="mailto:contact@arisestudio.com" style="color: #0284c7; text-decoration: none;">contact@arisestudio.com</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
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

        const emailAttachments = await loadEmailAttachments();

        await transporter.sendMail({
          from: `"AriseStudio Schedule" <${smtpUser}>`,
          to: recipient,
          replyTo: bookingData.email,
          subject: `[New Appointment] 30m with ${bookingData.name.replace(/[\r\n]/g, " ")} - ${bookingData.date} (${timeRangeStr})`,
          html: htmlContent,
          attachments: emailAttachments,
        });

        // Also send confirmation copy to the client
        await transporter.sendMail({
          from: `"AriseStudio Appointments" <${smtpUser}>`,
          to: bookingData.email,
          subject: `Confirmed: 30 minutes with AriseStudio on ${bookingData.date} (${timeRangeStr})`,
          html: htmlContent,
          attachments: emailAttachments,
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
      booking: bookingData
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

