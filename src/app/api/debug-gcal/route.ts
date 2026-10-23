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

function getEnvFuzzy(targetNames: string[]): { value: string; matchedKey?: string } {
  // 1. Direct match
  for (const name of targetNames) {
    if (process.env[name]) {
      return { value: cleanEnvValue(process.env[name]), matchedKey: name };
    }
  }
  // 2. Case-insensitive / space-tolerant match
  const normalizedTargets = targetNames.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const [k, v] of Object.entries(process.env)) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (let i = 0; i < normalizedTargets.length; i++) {
      if (cleanK === normalizedTargets[i] || cleanK.includes(normalizedTargets[i])) {
        return { value: cleanEnvValue(v), matchedKey: k };
      }
    }
  }
  return { value: "" };
}

export async function GET() {
  const clientMatch = getEnvFuzzy(["GOOGLE_CLIENT_ID", "CLIENT_ID"]);
  const secretMatch = getEnvFuzzy(["GOOGLE_CLIENT_SECRET", "CLIENT_SECRET", "GOOGLE_SECRET", "GOOGLE_CLIENT", "GOCSPX"]);
  const refreshMatch = getEnvFuzzy(["GOOGLE_REFRESH_TOKEN", "REFRESH_TOKEN"]);

  const clientId = clientMatch.value;
  const clientSecret = secretMatch.value;
  const refreshToken = refreshMatch.value;

  const allEnvKeys = Object.keys(process.env).sort();

  const envCheck = {
    GOOGLE_CLIENT_ID_found: Boolean(clientId),
    GOOGLE_CLIENT_ID_matched_key: clientMatch.matchedKey || "NONE",
    GOOGLE_CLIENT_ID_length: clientId.length,
    GOOGLE_CLIENT_SECRET_found: Boolean(clientSecret),
    GOOGLE_CLIENT_SECRET_matched_key: secretMatch.matchedKey || "NONE",
    GOOGLE_CLIENT_SECRET_length: clientSecret.length,
    GOOGLE_REFRESH_TOKEN_found: Boolean(refreshToken),
    GOOGLE_REFRESH_TOKEN_matched_key: refreshMatch.matchedKey || "NONE",
    GOOGLE_REFRESH_TOKEN_length: refreshToken.length,
    all_available_env_keys: allEnvKeys,
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
