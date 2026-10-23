import { createHash } from "node:crypto";

/**
 * Google Calendar API & Google Meet Integration
 * Creates official Google Calendar events with automatically generated unique Google Meet rooms.
 */

interface CreateMeetingParams {
  title: string;
  description: string;
  attendeeName: string;
  attendeeEmail: string;
  startIso: string;
  eventId?: string;
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

function getEnvFuzzy(targetNames: string[]): string {
  for (const name of targetNames) {
    if (process.env[name]) return cleanEnvValue(process.env[name]);
  }
  const normalizedTargets = targetNames.map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const [k, v] of Object.entries(process.env)) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (let i = 0; i < normalizedTargets.length; i++) {
      if (cleanK === normalizedTargets[i] || cleanK.includes(normalizedTargets[i])) {
        return cleanEnvValue(v);
      }
    }
  }
  return "";
}

/**
 * Exchanges Google OAuth2 Refresh Token for a fresh Access Token
 */
async function getGoogleAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
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
 * Creates an event on the primary Google Calendar with a unique Google Meet video room
 */
export async function createGoogleCalendarEvent(params: CreateMeetingParams): Promise<CalendarEventResult> {
  const clientId = getEnvFuzzy(["GOOGLE_CLIENT_ID", "CLIENT_ID"]);
  const clientSecret = getEnvFuzzy(["GOOGLE_CLIENT_SECRET", "CLIENT_SECRET", "GOOGLE_SECRET", "GOOGLE_CLIENT", "GOCSPX"]);
  const refreshToken = getEnvFuzzy(["GOOGLE_REFRESH_TOKEN", "REFRESH_TOKEN"]);

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
    const startIso = params.startIso;
    const endIso = new Date(Date.parse(startIso) + 30 * 60000).toISOString();
    const requestId = `arise-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const eventPayload = {
      ...(params.eventId ? { id: params.eventId } : {}),
      summary: params.title,
      description: params.description,
      start: {
        dateTime: startIso,
        timeZone: "UTC",
      },
      end: {
        dateTime: endIso,
        timeZone: "UTC",
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


export interface CalendarEvent {
  id: string;
  status: string;
  summary?: string;
  organizer?: { self?: boolean; email?: string };
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  attendees?: { email?: string }[];
  recurringEventId?: string;
}

// Scope sync state to the OAuth connection without requiring any new Google permissions.
export function googleCalendarConnectionId(): string | null {
  const clientId = getEnvFuzzy(["GOOGLE_CLIENT_ID", "CLIENT_ID"]);
  const refresh = getEnvFuzzy(["GOOGLE_REFRESH_TOKEN", "REFRESH_TOKEN"]);
  return clientId && refresh ? createHash("sha256").update(`${clientId}\n${refresh}`).digest("hex") : null;
}

// A complete page chain is required: partial/error responses must never release a slot.
export async function readGoogleCalendarChanges(tokens: Record<string, string>): Promise<{
  connectionId: string; events: CalendarEvent[]; syncToken: string;
} | null> {
  const clientId = getEnvFuzzy(["GOOGLE_CLIENT_ID", "CLIENT_ID"]);
  const secret = getEnvFuzzy(["GOOGLE_CLIENT_SECRET", "CLIENT_SECRET", "GOOGLE_SECRET", "GOOGLE_CLIENT", "GOCSPX"]);
  const refresh = getEnvFuzzy(["GOOGLE_REFRESH_TOKEN", "REFRESH_TOKEN"]);
  if (!clientId || !secret || !refresh) return null;
  const accessToken = await getGoogleAccessToken(clientId, secret, refresh);
  const options = { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" as const, signal: AbortSignal.timeout(10000) };
  const connectionId = googleCalendarConnectionId();
  if (!connectionId) return null;
  let syncToken = tokens[connectionId];
  let pageToken = "";
  const events: CalendarEvent[] = [];
  const seenPages = new Set<string>();
  for (let page = 0; page < 100; page++) {
    const query = new URLSearchParams({ showDeleted: "true", maxResults: "2500" });
    if (syncToken) query.set("syncToken", syncToken);
    if (pageToken) query.set("pageToken", pageToken);
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, options);
    if (response.status === 410 && syncToken) {
      syncToken = ""; pageToken = ""; events.length = 0; seenPages.clear();
      continue;
    }
    if (!response.ok) throw new Error("Calendar changes are unavailable");
    const data = await response.json();
    if (data.accessRole !== "owner" || !Array.isArray(data.items) || data.items.some((event: CalendarEvent) => !event || typeof event.id !== "string" || !event.id || !["confirmed", "tentative", "cancelled"].includes(event.status))) {
      throw new Error("Incomplete organizer Calendar response");
    }
    events.push(...data.items);
    if (data.nextPageToken) {
      if (typeof data.nextPageToken !== "string" || seenPages.has(data.nextPageToken)) throw new Error("Invalid Calendar pagination");
      seenPages.add(data.nextPageToken); pageToken = data.nextPageToken;
    } else {
      if (typeof data.nextSyncToken !== "string" || !data.nextSyncToken) throw new Error("Calendar sync token is missing");
      return { connectionId, events, syncToken: data.nextSyncToken };
    }
  }
  throw new Error("Calendar page limit exceeded");
}
