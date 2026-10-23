import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import nodemailer from 'nodemailer';
import * as crypto from 'node:crypto';
import { createClient } from '@libsql/client';

const root = fileURLToPath(new URL('..', import.meta.url));
const external = { 'node:crypto': crypto, path, 'fs/promises': fsPromises, nodemailer, '@libsql/client': { createClient } };
const NOW = Date.UTC(2030, 0, 6);
let clockNow = NOW;
class Clock extends Date {
  constructor(...args) { super(...(args.length ? args : [clockNow])); }
  static now() { return clockNow; }
}
// Load the real TypeScript modules with isolated env, clock and provider boundaries.
function app(stubs = {}, env = {}) {
  const modules = new Map();
  function load(name) {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    const file = path.resolve(root, name.startsWith('@/') ? `src/${name.slice(2)}.ts` : name);
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    modules.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    vm.runInNewContext(code, {
      exports, require: dependency => dependency.startsWith('@/') ? load(dependency) : dependency.startsWith('.') ? load(path.resolve(path.dirname(file), `${dependency}.ts`)) : Object.hasOwn(stubs, dependency) ? stubs[dependency] : external[dependency],
      process: { env, cwd: () => '/isolated-test' }, Date: Clock, URLSearchParams, TextDecoder, AbortSignal,
      console: { log() {}, warn() {}, error() {} }, fetch: stubs.fetch,
    }, { filename: file });
    return exports;
  }
  return load;
}
const next = { connection: async () => {}, NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } };
const missingFiles = { readFile: async () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }); } };
const base = { name: 'Alice', email: 'alice@example.test', phone: '+8801700000000', date: 'Monday, January 7, 2030', timeSlot: '10:00am', timezone: 'Asia/Dhaka' };
const lead = { name: 'Alice', email: 'alice@example.test', message: 'Please discuss this workflow.' };
const req = (body, ip = '127.0.0.1') => new Request('http://local.test/api', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) });
function setup(t, extra = {}, env = {}) {
  const client = createClient({ url: 'file::memory:' });
  t.after(() => { client.close(); clockNow = NOW; });
  let events = 0;
  const load = app({
    'next/server': next, 'fs/promises': missingFiles,
    '@libsql/client': { createClient: () => client },
    '@/lib/googleCalendar': { googleCalendarConnectionId: () => 'test-connection', readGoogleCalendarChanges: async () => null, createGoogleCalendarEvent: async () => { events++; return { success: true, meetUrl: 'https://meet.google.com/mock' }; } },
    ...extra,
  }, { TURSO_DATABASE_URL: 'file::memory:', ...env });
  return { client, load, events: () => events };
}

test('same slot is reserved once under concurrent requests; original customer is retained', async t => {
  const { load, client, events } = setup(t);
  const route = load('src/app/api/schedule/route.ts');
  const responses = await Promise.all([route.POST(req(base, '1')), route.POST(req({ ...base, name: 'Bob', email: 'bob@example.test' }, '2'))]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
  assert.equal(events(), 1);
  const rows = await client.execute('SELECT name FROM bookings');
  assert.equal(rows.rows.length, 1);
  const successful = responses.findIndex(r => r.status === 200);
  assert.equal(rows.rows[0].name, successful === 0 ? 'Alice' : 'Bob');
});

test('already persisted booking rejects retries without creating another calendar event', async t => {
  const { load, client, events } = setup(t);
  const route = load('src/app/api/schedule/route.ts');
  assert.equal((await route.POST(req(base))).status, 200);
  assert.equal((await route.POST(req({ ...base, name: 'Changed' }))).status, 409);
  assert.equal((await client.execute('SELECT name FROM bookings')).rows[0].name, 'Alice');
  assert.equal(events(), 1);
});

test('legacy file reservations remain blocked and appear in availability', async t => {
  const { load, events } = setup(t, { 'fs/promises': { readFile: async () => JSON.stringify(base) + '\n' } });
  const route = load('src/app/api/schedule/route.ts');
  assert.equal((await route.POST(req(base))).status, 409);
  assert.equal(events(), 0);
  const available = await route.GET();
  assert.equal(available.status, 200);
  assert.ok(available.body.bookedSlots.includes(`${base.date}_${base.timeSlot}`));
});

for (const [label, changes] of Object.entries({
  invalidDate: { date: 'not-a-date' }, invalidTime: { timeSlot: '99:99pm' },
  closedFriday: { date: 'Friday, January 11, 2030' }, past: { date: 'Saturday, January 5, 2030' },
  outsideHours: { timeSlot: '6:00pm' }, wrongWeekday: { date: 'Tuesday, January 7, 2030' },
  invalidTimezone: { timezone: 'invented/timezone' }, numericPhone: { phone: 42 },
})) test(`booking rejects ${label} before storage and provider calls`, async t => {
  const { load, events, client } = setup(t);
  assert.equal((await load('src/app/api/schedule/route.ts').POST(req({ ...base, ...changes }))).status, 400);
  assert.equal(events(), 0);
  assert.equal((await client.execute("SELECT name FROM sqlite_master WHERE name='bookings'")).rows.length, 0);
});

test('storage failure returns 503 and creates no external event', async t => {
  let events = 0;
  const { load } = setup(t, {
    '@/lib/turso': { reserveBooking: async () => { throw Error('disk full'); }, getDatabase: async () => { throw Error('offline'); } },
    '@/lib/googleCalendar': { googleCalendarConnectionId: () => 'test-connection', readGoogleCalendarChanges: async () => null, createGoogleCalendarEvent: async () => { events++; return {}; } },
  });
  const route = load('src/app/api/schedule/route.ts');
  assert.equal((await route.POST(req(base))).status, 503);
  assert.equal((await route.GET()).status, 503);
  assert.equal(events, 0);
  assert.equal((await load('src/app/api/contact/route.ts').POST(req(lead))).status, 503);
});

test('production without persistent storage fails instead of using temporary files', async () => {
  const load = app({}, { NODE_ENV: 'production' });
  await assert.rejects(load('src/lib/turso.ts').getDatabase(), /TURSO_DATABASE_URL/);
});

test('contact is saved before optional SMTP; provider failure does not discard the saved lead', async t => {
  const { load, client } = setup(t, { nodemailer: { createTransport: () => ({ sendMail: async () => { throw Error('SMTP offline'); } }) } }, { SMTP_HOST: 'mock', SMTP_USER: 'mock', SMTP_PASS: 'mock' });
  const response = await load('src/app/api/contact/route.ts').POST(req(lead));
  assert.equal(response.status, 200);
  assert.equal(response.body.emailSent, false);
  assert.equal(JSON.parse((await client.execute('SELECT submission FROM contact_leads')).rows[0].submission).message, lead.message);
});

for (const [label, changes] of Object.entries({ numericPhone: { phone: 42 }, objectCompany: { company: {} }, objectService: { service: {} }, oversizedMessage: { message: 'x'.repeat(5001) }, emptyName: { name: ' ' } })) {
  test(`contact rejects ${label}`, async t => {
    const { load } = setup(t);
    assert.equal((await load('src/app/api/contact/route.ts').POST(req({ ...lead, ...changes }))).status, 400);
  });
}

test('malformed JSON and oversized bodies return 400/413', async t => {
  const { load } = setup(t);
  const route = load('src/app/api/contact/route.ts');
  assert.equal((await route.POST(new Request('http://local.test', { method: 'POST', body: '{' }))).status, 400);
  assert.equal((await route.POST(req({ ...lead, message: 'x'.repeat(40000) }))).status, 413);
});

test('contact IP and email throttles reject excess requests', async t => {
  const { load } = setup(t);
  const route = load('src/app/api/contact/route.ts');
  assert.equal((await route.POST(req(lead, 'one'))).status, 200);
  assert.equal((await route.POST(req(lead, 'two'))).status, 200);
  assert.equal((await route.POST(req(lead, 'three'))).status, 429);
  for (let i = 0; i < 5; i++) assert.equal((await route.POST(req({ ...lead, email: `person${i}@example.test` }, 'shared'))).status, 200);
  assert.equal((await route.POST(req({ ...lead, email: 'last@example.test' }, 'shared'))).status, 429);
});

test('timezone display preserves the host slot instant; DST and previous-day labels are correct', () => {
  const booking = app()('src/lib/booking.ts');
  const start = booking.bookingStartIso(base.date, base.timeSlot);
  assert.equal(start, '2030-01-07T04:00:00.000Z');
  assert.match(booking.formatBookingDate(start, 'America/Los_Angeles'), /January 6, 2030/);
  assert.match(booking.formatBookingTime(start, 'America/New_York'), /11:00 PM EST/);
  assert.match(booking.formatBookingTime('2030-07-08T04:00:00Z', 'America/New_York'), /12:00 AM EDT/);
  const url = new URL(booking.googleCalendarUrl(start, 'Title', 'Details', ''));
  assert.equal(url.searchParams.get('dates'), '20300107T040000Z/20300107T043000Z');
  assert.equal(booking.hostToday(new Date('2030-01-06T20:00:00Z')).getDate(), 7);
});

test('Calendar API uses the canonical instant', async () => {
  const requests = [];
  const google = app({ fetch: async (url, options) => {
    if (url.includes('oauth2')) return { ok: true, json: async () => ({ access_token: 'mock' }) };
    requests.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ id: 'mock', hangoutLink: 'https://meet.google.com/mock' }) };
  } }, { GOOGLE_CLIENT_ID: 'mock', GOOGLE_CLIENT_SECRET: 'mock', GOOGLE_REFRESH_TOKEN: 'mock' })('src/lib/googleCalendar.ts');
  await google.createGoogleCalendarEvent({ title: 'Call', description: '', attendeeName: base.name, attendeeEmail: base.email, startIso: '2030-01-07T04:00:00.000Z' });
  assert.equal(requests[0].start.dateTime, '2030-01-07T04:00:00.000Z');
  assert.equal(requests[0].end.dateTime, '2030-01-07T04:30:00.000Z');
  assert.equal(requests[0].start.timeZone, 'UTC');
});

test('different display timezones cannot reserve the same host slot twice', async t => {
  const { load, events } = setup(t);
  const route = load('src/app/api/schedule/route.ts');
  const first = await route.POST(req({ ...base, timezone: 'America/New_York' }));
  assert.equal(first.status, 200);
  assert.equal(first.body.booking.startIso, '2030-01-07T04:00:00.000Z');
  assert.equal(first.body.emailSent, false);
  assert.equal((await route.POST(req({ ...base, timezone: 'Europe/London' }))).status, 409);
  assert.equal(events(), 1);
});

test('confirmation email and browser calendar link describe the same UTC slot', async t => {
  const sent = [];
  const { load } = setup(t, { nodemailer: { createTransport: () => ({ sendMail: async message => sent.push(message) }) } }, { SMTP_HOST: 'mock', SMTP_USER: 'mock@example.test', SMTP_PASS: 'mock' });
  const response = await load('src/app/api/schedule/route.ts').POST(req({ ...base, timezone: 'America/Los_Angeles' }));
  assert.equal(response.status, 200);
  assert.equal(response.body.emailSent, true);
  assert.equal(sent.length, 2);
  assert.match(sent[1].html, /Sunday, January 6, 2030/);
  assert.match(sent[1].html, /8:00 PM PST/);
  const link = sent[1].html.match(/href="(https:\/\/calendar\.google\.com[^\"]+)"/)[1];
  assert.equal(new URL(link).searchParams.get('dates'), '20300107T040000Z/20300107T043000Z');
});

test('existing booking data survives additive schema initialization', async t => {
  const { load, client } = setup(t);
  await client.execute('CREATE TABLE bookings (id INTEGER PRIMARY KEY, date TEXT, timeSlot TEXT, name TEXT, email TEXT, company TEXT, timezone TEXT, service TEXT, notes TEXT, UNIQUE(date, timeSlot))');
  await client.execute({ sql: 'INSERT INTO bookings (date, timeSlot, name, email) VALUES (?, ?, ?, ?)', args: [base.date, base.timeSlot, 'Original', base.email] });
  await load('src/lib/turso.ts').getDatabase();
  assert.equal((await client.execute('SELECT name FROM bookings')).rows[0].name, 'Original');
  assert.ok((await client.execute('PRAGMA table_info(bookings)')).rows.some(row => row.name === 'phone'));
});

function calendarSetup(t, extra = {}) {
  let feed = [], failure = false;
  const created = [], reads = [];
  const context = setup(t, {
    '@/lib/googleCalendar': {
      googleCalendarConnectionId: () => 'test-connection',
      createGoogleCalendarEvent: async params => {
        created.push(params);
        return { success: true, eventId: params.eventId, meetUrl: 'https://meet.google.com/mock' };
      },
      readGoogleCalendarChanges: async tokens => {
        reads.push({ ...tokens });
        if (failure) throw Error('Calendar unavailable');
        return { connectionId: 'test-connection', events: feed, syncToken: `token-${reads.length}` };
      },
    },
    ...extra,
  });
  return { ...context, created, reads, setFeed: value => { feed = value; }, fail: () => { failure = true; }, tick: () => { clockNow += 16000; } };
}
const legacyEvent = (overrides = {}) => ({
  id: 'legacy-event', status: 'confirmed', summary: `30-Min Discovery Session | AriseStudio with ${base.name}`,
  organizer: { self: true }, start: { dateTime: '2030-01-07T04:00:00Z' }, end: { dateTime: '2030-01-07T04:30:00Z' },
  attendees: [{ email: base.email }], ...overrides,
});

test('host cancellation archives the original booking and allows a new reservation', async t => {
  const ctx = calendarSetup(t), route = ctx.load('src/app/api/schedule/route.ts');
  assert.equal((await route.POST(req(base))).status, 200);
  const eventId = ctx.created[0].eventId;
  assert.match(eventId, /^[a-f0-9]{32}$/);
  assert.equal((await ctx.client.execute('SELECT eventId FROM booking_calendar_events')).rows[0].eventId, eventId);
  ctx.setFeed([{ id: eventId, status: 'cancelled' }]); ctx.tick();
  const availability = await route.GET();
  assert.equal(availability.status, 200);
  assert.equal(availability.body.bookedSlots.length, 0);
  const archived = (await ctx.client.execute('SELECT * FROM booking_calendar_events')).rows[0];
  assert.ok(archived.cancelledAt);
  const snapshot = JSON.parse(archived.snapshot);
  assert.equal(snapshot.name, base.name); assert.equal(snapshot.email, base.email); assert.ok(snapshot.createdAt);
  assert.equal((await route.POST(req({ ...base, name: 'Bob', email: 'bob@example.test' }))).status, 200);
  assert.equal((await ctx.client.execute('SELECT name FROM bookings')).rows[0].name, 'Bob');
  // Repeated old cancellation must not cancel the replacement booking.
  ctx.tick(); await route.GET();
  assert.equal((await ctx.client.execute('SELECT name FROM bookings')).rows[0].name, 'Bob');
});

test('incremental sync tokens are persisted and reused', async t => {
  const ctx = calendarSetup(t), route = ctx.load('src/app/api/schedule/route.ts');
  await route.POST(req(base)); ctx.tick();
  ctx.setFeed([{ id: ctx.created[0].eventId, status: 'confirmed' }]); await route.GET();
  assert.deepEqual(ctx.reads[0], {});
  ctx.tick(); await route.GET();
  assert.equal(ctx.reads[1]['test-connection'], 'token-1');
});

for (const [label, event] of Object.entries({
  absent: null, attendeeDecline: { status: 'confirmed', attendees: [{ email: base.email, responseStatus: 'declined' }] },
  attendeeCalendarCopy: { status: 'cancelled', organizer: { self: false } },
  recurringException: { status: 'cancelled', recurringEventId: 'parent-event' },
})) test(`${label} does not release a known booking`, async t => {
  const ctx = calendarSetup(t), route = ctx.load('src/app/api/schedule/route.ts');
  await route.POST(req(base)); ctx.tick();
  ctx.setFeed(event ? [{ id: ctx.created[0].eventId, ...event }] : []);
  const availability = await route.GET();
  assert.equal(availability.body.bookedSlots.length, 1);
  assert.equal((await ctx.client.execute('SELECT * FROM bookings')).rows.length, 1);
});

test('Google errors keep the slot locked and leave the sync token unchanged', async t => {
  const ctx = calendarSetup(t), route = ctx.load('src/app/api/schedule/route.ts');
  await route.POST(req(base)); ctx.tick(); ctx.fail();
  assert.equal((await route.GET()).body.bookedSlots.length, 1);
  assert.equal((await ctx.client.execute('SELECT * FROM calendar_sync_state')).rows.length, 0);
});

test('a different OAuth connection cannot cancel the original booking by event ID alone', async t => {
  let eventId;
  const ctx = calendarSetup(t, { '@/lib/googleCalendar': {
    googleCalendarConnectionId: () => 'original-connection',
    createGoogleCalendarEvent: async params => { eventId = params.eventId; return { success: true, eventId, meetUrl: null }; },
    readGoogleCalendarChanges: async () => ({ connectionId: 'different-connection', events: [{ id: eventId, status: 'cancelled' }], syncToken: 'new-token' }),
  } });
  const route = ctx.load('src/app/api/schedule/route.ts');
  await route.POST(req(base)); ctx.tick();
  assert.equal((await route.GET()).body.bookedSlots.length, 1);
});

test('legacy database reservations link only to an exact organizer event and then cancel', async t => {
  const ctx = calendarSetup(t), storage = ctx.load('src/lib/turso.ts');
  await storage.reserveBooking({ ...base, company: '', service: '', notes: '' });
  ctx.setFeed([legacyEvent({ status: 'cancelled' })]);
  const route = ctx.load('src/app/api/schedule/route.ts');
  assert.equal((await route.GET()).body.bookedSlots.length, 0);
  const archived = (await ctx.client.execute('SELECT * FROM booking_calendar_events')).rows[0];
  assert.equal(archived.eventId, 'legacy-event'); assert.ok(archived.cancelledAt);
});

test('cancelled legacy files remain intact without permanently relocking a released slot', async t => {
  const content = JSON.stringify(base) + '\n'; let writes = 0;
  const ctx = calendarSetup(t, { 'fs/promises': { readFile: async () => content, writeFile: async () => { writes++; } } });
  ctx.setFeed([legacyEvent({ status: 'cancelled' })]);
  const route = ctx.load('src/app/api/schedule/route.ts');
  assert.equal((await route.GET()).body.bookedSlots.length, 0);
  assert.equal((await route.POST(req({ ...base, email: 'new@example.test' }))).status, 200);
  assert.equal((await route.GET()).body.bookedSlots.length, 1);
  assert.equal(writes, 0);
});

for (const [label, feed] of Object.entries({
  ambiguous: [legacyEvent(), legacyEvent({ id: 'duplicate', status: 'cancelled' })],
  wrongAttendee: [legacyEvent({ status: 'cancelled', attendees: [{ email: 'someone@example.test' }] })],
  wrongStart: [legacyEvent({ status: 'cancelled', start: { dateTime: '2030-01-07T05:00:00Z' } })],
  tombstoneWithoutIdentity: [{ id: 'unknown-event', status: 'cancelled' }],
})) test(`${label} leaves legacy bookings locked`, async t => {
  const ctx = calendarSetup(t), storage = ctx.load('src/lib/turso.ts');
  await storage.reserveBooking({ ...base, company: '', service: '', notes: '' });
  ctx.setFeed(feed);
  assert.equal((await ctx.load('src/app/api/schedule/route.ts').GET()).body.bookedSlots.length, 1);
});

test('archive failure rolls back cancellation and preserves the booking', async t => {
  const ctx = calendarSetup(t), route = ctx.load('src/app/api/schedule/route.ts');
  await route.POST(req(base));
  await ctx.client.execute("CREATE TRIGGER reject_archive BEFORE UPDATE ON booking_calendar_events BEGIN SELECT RAISE(ABORT, 'disk failure'); END");
  ctx.setFeed([{ id: ctx.created[0].eventId, status: 'cancelled' }]); ctx.tick();
  assert.equal((await route.GET()).body.bookedSlots.length, 1);
  assert.equal((await ctx.client.execute('SELECT cancelledAt FROM booking_calendar_events')).rows[0].cancelledAt, null);
  assert.equal((await ctx.client.execute('SELECT * FROM calendar_sync_state')).rows.length, 0);
});

const googleEnv = { GOOGLE_CLIENT_ID: 'mock-client', GOOGLE_CLIENT_SECRET: 'mock-secret', GOOGLE_REFRESH_TOKEN: 'mock-refresh' };
function googleReader(handler) {
  return app({ fetch: async (url, options) => url.includes('oauth2') ? { ok: true, json: async () => ({ access_token: 'mock' }) } : handler(new URL(url), options) }, googleEnv)('src/lib/googleCalendar.ts');
}
const okPage = body => ({ ok: true, status: 200, json: async () => ({ accessRole: 'owner', ...body }) });

test('Calendar change reader collects every page before returning a sync token', async () => {
  const urls = [];
  const reader = googleReader(async url => {
    urls.push(url);
    return url.searchParams.has('pageToken') ? okPage({ items: [{ id: 'deleted', status: 'cancelled' }], nextSyncToken: 'finished' }) : okPage({ items: [], nextPageToken: 'page-2' });
  });
  const result = await reader.readGoogleCalendarChanges({});
  assert.equal(result.events[0].id, 'deleted'); assert.equal(result.syncToken, 'finished');
  assert.equal(urls[0].searchParams.get('showDeleted'), 'true');
  assert.equal(urls[1].searchParams.get('pageToken'), 'page-2');
});

test('expired Google sync token triggers a complete baseline without treating absence as cancellation', async () => {
  const seen = [];
  const reader = googleReader(async url => {
    seen.push(url);
    return url.searchParams.has('syncToken') ? { ok: false, status: 410 } : okPage({ items: [], nextSyncToken: 'reset' });
  });
  const result = await reader.readGoogleCalendarChanges({ [reader.googleCalendarConnectionId()]: 'expired' });
  assert.equal(result.events.length, 0); assert.equal(result.syncToken, 'reset');
  assert.equal(seen[0].searchParams.get('syncToken'), 'expired');
  assert.equal(seen[1].searchParams.has('syncToken'), false);
});

test('partial pages, permission errors and non-organizer calendars never return cancellation evidence', async () => {
  for (const status of [401, 403, 404, 429, 500]) {
    const reader = googleReader(async () => ({ ok: false, status }));
    await assert.rejects(reader.readGoogleCalendarChanges({}), /unavailable/);
  }
  const reader = googleReader(async url => url.searchParams.has('pageToken') ? { ok: false, status: 503 } : okPage({ items: [{ id: 'deleted', status: 'cancelled' }], nextPageToken: 'two' }));
  await assert.rejects(reader.readGoogleCalendarChanges({}), /unavailable/);
  const other = googleReader(async () => okPage({ accessRole: 'reader', items: [], nextSyncToken: 'token' }));
  await assert.rejects(other.readGoogleCalendarChanges({}), /organizer/);
});

test('event identity persistence failure rolls back the reservation before Google is called', async t => {
  const ctx = calendarSetup(t);
  await ctx.load('src/lib/turso.ts').getDatabase();
  await ctx.client.execute("CREATE TRIGGER reject_link BEFORE INSERT ON booking_calendar_events BEGIN SELECT RAISE(ABORT, 'disk failure'); END");
  const response = await ctx.load('src/app/api/schedule/route.ts').POST(req(base));
  assert.equal(response.status, 503);
  assert.equal((await ctx.client.execute('SELECT * FROM bookings')).rows.length, 0);
  assert.equal(ctx.created.length, 0);
});
