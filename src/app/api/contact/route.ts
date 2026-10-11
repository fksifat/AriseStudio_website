import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, service, budget, message } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid corporate email address is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Please provide a brief message describing your requirements." },
        { status: 400 }
      );
    }

    const leadData = {
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "Not provided").trim(),
      company: (company || "Not provided").trim(),
      service: service || "General Inquiry",
      budget: budget || "Not specified",
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    console.log("[AriseStudio Contact Lead Received]:", leadData);

    // Optional email dispatch via SMTP if environment variables are configured
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 8px; background-color: #09101d; color: #f8fafc;">
            <h2 style="color: #10b981; margin-bottom: 16px;">🚀 New Consultation Lead | AriseStudio</h2>
            <p style="font-size: 14px; color: #94a3b8;">A new consultation request was submitted through the website.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold; width: 140px;">Full Name:</td>
                <td style="padding: 10px; color: #ffffff;">${leadData.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Email:</td>
                <td style="padding: 10px; color: #ffffff;"><a href="mailto:${leadData.email}" style="color: #38bdf8;">${leadData.email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Phone / WhatsApp:</td>
                <td style="padding: 10px; color: #ffffff;">${leadData.phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Company:</td>
                <td style="padding: 10px; color: #ffffff;">${leadData.company}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Service Needed:</td>
                <td style="padding: 10px; color: #ffffff;">${leadData.service}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px; color: #a7f3d0; font-weight: bold;">Budget Bracket:</td>
                <td style="padding: 10px; color: #ffffff;">${leadData.budget}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; padding: 15px; background-color: #004157; border-radius: 6px;">
              <h3 style="margin-top: 0; color: #34d399; font-size: 14px;">Project Details / Message:</h3>
              <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #f1f5f9;">${leadData.message}</p>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Submitted on ${new Date().toLocaleString()}</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"AriseStudio Website" <${smtpUser}>`,
          to: recipient,
          replyTo: leadData.email,
          subject: `[Lead] ${leadData.name} - ${leadData.service} (${leadData.company})`,
          html: htmlContent,
        });

        emailSent = true;
      } catch (mailError) {
        console.error("[SMTP Notification Error]:", mailError);
        // Continue to return success so the user lead is acknowledged
      }
    }

    return NextResponse.json({
      success: true,
      message: "Consultation request recorded successfully.",
      emailSent,
      lead: {
        name: leadData.name,
        company: leadData.company,
        service: leadData.service,
      },
    });
  } catch (error) {
    console.error("[Contact API Error]:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

