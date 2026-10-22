import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { getTursoClient, initTursoSchema } from "@/lib/turso";

const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

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
    const { name, email, company, date, timeSlot, timezone, service, notes } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid corporate email is required." },
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

    // Use configured Google Meet room URL if available
    const customMeetUrl = process.env.GOOGLE_MEET_URL?.trim() || process.env.NEXT_PUBLIC_GOOGLE_MEET_URL?.trim() || null;
    const googleMeetUrl = customMeetUrl;

    const bookingData = {
      name: name.trim(),
      email: email.trim(),
      company: (company || "Not provided").trim(),
      date,
      timeSlot,
      timezone: timezone || "Bangladesh Time (BST / GMT+6)",
      service: service || "General Architecture Consultation",
      notes: (notes || "No additional notes provided").trim(),
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
            INSERT INTO bookings (date, timeSlot, name, email, company, timezone, service, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date, timeSlot) DO UPDATE SET
              name = excluded.name,
              email = excluded.email,
              company = excluded.company,
              notes = excluded.notes;
          `,
          args: [
            bookingData.date,
            bookingData.timeSlot,
            bookingData.name,
            bookingData.email,
            bookingData.company || "",
            bookingData.timezone || "",
            bookingData.service || "",
            bookingData.notes || "",
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

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background-color: #09101d; color: #f8fafc;">
            <h2 style="color: #10b981; margin-bottom: 8px;">🗓️ 30-Min Call Scheduled | AriseStudio</h2>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 0;">A new technical discovery consultation has been confirmed.</p>
            
            <div style="margin: 20px 0; padding: 16px; background-color: #004157; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #ffffff;">📅 ${escapeHtml(bookingData.date)} at ${escapeHtml(bookingData.timeSlot)}</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #a7f3d0;">Timezone: ${escapeHtml(bookingData.timezone)}</p>
              ${bookingData.googleMeetUrl && /^https?:\/\//i.test(bookingData.googleMeetUrl) ? `<p style="margin: 8px 0 0; font-size: 14px; color: #ffffff;">📹 Google Meet: <a href="${encodeURI(bookingData.googleMeetUrl)}" style="color: #38bdf8; text-decoration: underline;">${escapeHtml(bookingData.googleMeetUrl)}</a></p>` : `<p style="margin: 8px 0 0; font-size: 13px; color: #a7f3d0;">📹 Google Meet: Video link attached via calendar invite.</p>`}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold; width: 140px;">Client Name:</td>
                <td style="padding: 10px; color: #ffffff;">${escapeHtml(bookingData.name)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Corporate Email:</td>
                <td style="padding: 10px; color: #ffffff;"><a href="mailto:${encodeURIComponent(bookingData.email)}" style="color: #38bdf8;">${escapeHtml(bookingData.email)}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Company:</td>
                <td style="padding: 10px; color: #ffffff;">${escapeHtml(bookingData.company)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Topic / Area:</td>
                <td style="padding: 10px; color: #ffffff;">${escapeHtml(bookingData.service)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Project Notes:</td>
                <td style="padding: 10px; color: #f1f5f9; white-space: pre-wrap;">${escapeHtml(bookingData.notes)}</td>
              </tr>
            </table>

            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Generated by AriseStudio Appointment Scheduler · ${new Date().toLocaleString()}</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"AriseStudio Schedule" <${smtpUser}>`,
          to: recipient,
          replyTo: bookingData.email,
          subject: `[Appointment] 30m with ${bookingData.name.replace(/[\r\n]/g, " ")} (${bookingData.company.replace(/[\r\n]/g, " ")}) - ${bookingData.date} ${bookingData.timeSlot}`,
          html: htmlContent,
        });

        // Also send confirmation copy to the client
        await transporter.sendMail({
          from: `"AriseStudio Appointments" <${smtpUser}>`,
          to: bookingData.email,
          subject: `Confirmed: 30 minutes with AriseStudio on ${bookingData.date} at ${bookingData.timeSlot}`,
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

