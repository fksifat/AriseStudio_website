/**
 * Google Calendar API & Google Meet Integration
 * Creates official Google Calendar events with automatically generated unique Google Meet rooms.
 */

interface CreateMeetingParams {
  title: string;
  description: string;
  attendeeName: string;
  attendeeEmail: string;
  dateStr: string;     // e.g. "Monday, October 26, 2026"
  timeSlot: string;    // e.g. "10:00am"
  timezone?: string;   // e.g. "Asia/Dhaka" or "(GMT+06:00) Bangladesh Standard Time"
}

interface CalendarEventResult {
  success: boolean;
  meetUrl: string | null;
  eventId: string | null;
  calendarEventUrl: string | null;
  error?: string;
}

/**
 * Cleans environment variable value by trimming and removing outer quotes
 * (safeguards against values pasted into Vercel UI with surrounding quotes).
 */
function cleanEnvValue(value?: string): string {
  if (!value) return "";
  let v = value.trim();
  while ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

/**
 * Exchanges Google OAuth2 Refresh Token for a fresh Access Token
 */
async function getGoogleAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    console.error("[Google OAuth Token Error]:", data);
    throw new Error(data.error_description || data.error || "Failed to refresh Google access token.");
  }

  return data.access_token;
}

/**
 * Parses booking date and timeslot into ISO strings for Google Calendar
 */
function parseBookingToUtcIso(dateStr: string, timeSlot: string): { startIso: string; endIso: string } {
  const parsedDate = new Date(dateStr);
  const match = timeSlot.match(/(\d+):(\d+)(am|pm)/i);
  let startHour = 10;
  let startMin = 0;

  if (match) {
    startHour = parseInt(match[1], 10);
    startMin = parseInt(match[2], 10);
    const meridiem = match[3].toLowerCase();
    if (meridiem === "pm" && startHour < 12) startHour += 12;
    if (meridiem === "am" && startHour === 12) startHour = 0;
  }

  const year = isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear();
  const month = isNaN(parsedDate.getTime()) ? new Date().getMonth() : parsedDate.getMonth();
  const day = isNaN(parsedDate.getTime()) ? new Date().getDate() : parsedDate.getDate();

  // Bangladesh Time is UTC+6 -> subtract 6 hours for UTC
  const startUtc = new Date(Date.UTC(year, month, day, startHour - 6, startMin, 0));
  const endUtc = new Date(startUtc.getTime() + 30 * 60 * 1000);

  return {
    startIso: startUtc.toISOString(),
    endIso: endUtc.toISOString(),
  };
}

/**
 * Creates an event on the primary Google Calendar with a unique Google Meet video room
 */
export async function createGoogleCalendarEvent(params: CreateMeetingParams): Promise<CalendarEventResult> {
  const clientId = cleanEnvValue(process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID);
  const clientSecret = cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT || process.env.GOOGLE_SECRET);
  const refreshToken = cleanEnvValue(process.env.GOOGLE_REFRESH_TOKEN || process.env.REFRESH_TOKEN);

  // If credentials are not configured, return null gracefully so fallback room is used
  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [
      !clientId && "GOOGLE_CLIENT_ID",
      !clientSecret && "GOOGLE_CLIENT_SECRET",
      !refreshToken && "GOOGLE_REFRESH_TOKEN",
    ].filter(Boolean).join(", ");
    console.warn(`[Google Calendar Notice]: Missing credentials in environment (${missing})`);
    return {
      success: false,
      meetUrl: null,
      eventId: null,
      calendarEventUrl: null,
      error: `Missing credentials in environment: ${missing}`,
    };
  }

  try {
    const accessToken = await getGoogleAccessToken(clientId, clientSecret, refreshToken);
    const { startIso, endIso } = parseBookingToUtcIso(params.dateStr, params.timeSlot);
    const requestId = `arise-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const eventPayload = {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: startIso,
        timeZone: "Asia/Dhaka",
      },
      end: {
        dateTime: endIso,
        timeZone: "Asia/Dhaka",
      },
      attendees: [
        { email: params.attendeeEmail, displayName: params.attendeeName },
      ],
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    };

    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("[Google Calendar API Error]:", data);
      return {
        success: false,
        meetUrl: null,
        eventId: null,
        calendarEventUrl: null,
        error: data.error?.message || "Failed to create Google Calendar event.",
      };
    }

    const meetUrl =
      data.hangoutLink ||
      data.conferenceData?.entryPoints?.find((ep: { entryPointType: string }) => ep.entryPointType === "video")?.uri ||
      null;

    return {
      success: true,
      meetUrl,
      eventId: data.id || null,
      calendarEventUrl: data.htmlLink || null,
    };
  } catch (err) {
    console.error("[Google Calendar Creation Exception]:", err);
    return {
      success: false,
      meetUrl: null,
      eventId: null,
      calendarEventUrl: null,
      error: err instanceof Error ? err.message : "Unknown error during Google Calendar event creation",
    };
  }
}

