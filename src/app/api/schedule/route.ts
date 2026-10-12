import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #ffffff;">📅 ${bookingData.date} at ${bookingData.timeSlot}</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #a7f3d0;">Timezone: ${bookingData.timezone}</p>
              ${bookingData.googleMeetUrl ? `<p style="margin: 8px 0 0; font-size: 14px; color: #ffffff;">📹 Google Meet: <a href="${bookingData.googleMeetUrl}" style="color: #38bdf8; text-decoration: underline;">${bookingData.googleMeetUrl}</a></p>` : `<p style="margin: 8px 0 0; font-size: 13px; color: #a7f3d0;">📹 Google Meet: Video link attached via calendar invite.</p>`}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold; width: 140px;">Client Name:</td>
                <td style="padding: 10px; color: #ffffff;">${bookingData.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Corporate Email:</td>
                <td style="padding: 10px; color: #ffffff;"><a href="mailto:${bookingData.email}" style="color: #38bdf8;">${bookingData.email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Company:</td>
                <td style="padding: 10px; color: #ffffff;">${bookingData.company}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Topic / Area:</td>
                <td style="padding: 10px; color: #ffffff;">${bookingData.service}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Project Notes:</td>
                <td style="padding: 10px; color: #f1f5f9; white-space: pre-wrap;">${bookingData.notes}</td>
              </tr>
            </table>

            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Generated by AriseStudio Appointment Scheduler · ${new Date().toLocaleString()}</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"AriseStudio Schedule" <${smtpUser}>`,
          to: recipient,
          replyTo: bookingData.email,
          subject: `[Appointment] 30m with ${bookingData.name} (${bookingData.company}) - ${bookingData.date} ${bookingData.timeSlot}`,
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

