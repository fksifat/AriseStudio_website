import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let schemaInitialized = false;

export function getTursoClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return null;
  }

  if (!client) {
    client = createClient({
      url,
      authToken,
    });
  }

  return client;
}

export async function initTursoSchema(): Promise<boolean> {
  const turso = getTursoClient();
  if (!turso) return false;
  if (schemaInitialized) return true;

  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        timeSlot TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        timezone TEXT,
        service TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, timeSlot)
      );
    `);
    try {
      await turso.execute("ALTER TABLE bookings ADD COLUMN phone TEXT;");
    } catch {
      // column already exists
    }
    schemaInitialized = true;
    return true;
  } catch (err) {
    console.error("[Turso Init Schema Error]:", err);
    return false;
  }
}

