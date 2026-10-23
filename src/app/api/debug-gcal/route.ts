import { NextResponse } from "next/server";
import { createGoogleCalendarEvent } from "@/lib/googleCalendar";

function cleanEnvValue(value?: string): string {
  if (!value) return "";
  let v = value.trim();
  while ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export async function GET() {
  const rawClientId = process.env.GOOGLE_CLIENT_ID;
  const rawClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT || process.env.GOOGLE_SECRET;
  const rawRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  const clientId = cleanEnvValue(rawClientId);
  const clientSecret = cleanEnvValue(rawClientSecret);
  const refreshToken = cleanEnvValue(rawRefreshToken);

  const envCheck = {
    GOOGLE_CLIENT_ID_present: Boolean(rawClientId),
    GOOGLE_CLIENT_ID_length: rawClientId?.length || 0,
    GOOGLE_CLIENT_SECRET_present: Boolean(rawClientSecret),
    GOOGLE_CLIENT_SECRET_length: rawClientSecret?.length || 0,
    GOOGLE_REFRESH_TOKEN_present: Boolean(rawRefreshToken),
    GOOGLE_REFRESH_TOKEN_length: rawRefreshToken?.length || 0,
  };

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({
      success: false,
      stage: "environment_variables",
      envCheck,
      error: "One or more Google Calendar environment variables are missing in Vercel.",
    });
  }

  // 1. Test token refresh with Google OAuth
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.json({
        success: false,
        stage: "token_refresh_from_google",
        envCheck,
        googleOAuthError: tokenData,
      });
    }

    // 2. Test event and Meet link generation
    const eventResult = await createGoogleCalendarEvent({
      title: "AriseStudio Diagnostic Test",
      description: "Testing Google Meet creation",
      attendeeName: "Diagnostic Test",
      attendeeEmail: "arisestudio.offical@gmail.com",
      dateStr: "Thursday, October 29, 2026",
      timeSlot: "10:00am",
      timezone: "Asia/Dhaka",
    });

    return NextResponse.json({
      success: eventResult.success,
      stage: "google_calendar_call",
      envCheck,
      eventResult,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      stage: "network_or_system_exception",
      envCheck,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
