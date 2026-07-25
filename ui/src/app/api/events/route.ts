import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Real-data read path over analysis.latest_events (deduped, corroboration-safe).
// Reflects ADR-0005/0007: the app reads the deterministic derived layer, never raw.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const where: string[] = ["e.lat IS NOT NULL"];
  const args: unknown[] = [];
  const add = (clause: string, val: unknown) => { args.push(val); where.push(clause.replace('$?', `$${args.length}`)); };

  if (p.get('dateFrom')) add("e.start_eastern >= $?", p.get('dateFrom'));
  if (p.get('dateTo')) add("e.start_eastern <= ($? || 'T23:59:59')", p.get('dateTo'));
  const types = p.getAll('eventType');
  if (types.length) add("e.event_type = ANY($?)", types);
  if (p.get('overnight') === 'true') where.push("e.overnight_simple");
  if (p.get('query')) add("(e.serial_display ILIKE '%' || $? || '%' OR e.place_id ILIKE '%' || $? || '%')", p.get('query'));
  const minProb = p.get('minProbability');
  if (minProb) add("e.probability >= $?", Number(minProb));
  const tags = p.getAll('tag');
  if (tags.length) add("kp.tags && $?", tags);

  const limit = Math.min(Number(p.get('limit') ?? 2000), 20000);

  const sql = `
    SELECT e.event_id::text, e.serial_display, e.raw_type, e.event_type,
           to_char(e.start_eastern, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_eastern,
           to_char(e.end_eastern,   'YYYY-MM-DD"T"HH24:MI:SS') AS end_eastern,
           to_char(e.start_utc, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS start_utc,
           to_char(e.end_utc,   'YYYY-MM-DD"T"HH24:MI:SSOF') AS end_utc,
           e.lat, e.lng, e.lat_r4, e.lng_r4, e.place_id,
           COALESCE(kp.tags, '{}') AS tags,
           e.overnight_simple, e.probability
    FROM analysis.latest_events e
    LEFT JOIN ref.known_place kp
      ON (kp.place_id = e.place_id)
      OR (kp.place_id IS NULL AND kp.lat_r4 = e.lat_r4 AND kp.lng_r4 = e.lng_r4)
    WHERE ${where.join(' AND ')}
    ORDER BY e.start_utc
    LIMIT ${limit}`;

  try {
    const { rows } = await pool.query(sql, args);
    const events = rows.map(r => ({
      event_id: r.event_id,
      serial_display: r.serial_display,
      raw_type: r.raw_type,
      event_type: r.event_type,
      start_eastern: r.start_eastern,
      end_eastern: r.end_eastern,
      start_utc: r.start_utc,
      end_utc: r.end_utc,
      lat: Number(r.lat), lng: Number(r.lng),
      lat_r4: Number(r.lat_r4), lng_r4: Number(r.lng_r4),
      place_id: r.place_id ?? '',
      tags: r.tags ?? [],
      overnight_simple: r.overnight_simple ? 'overnight' : 'daytrip',
      probability: r.probability === null ? 0 : Number(r.probability),
    }));
    return NextResponse.json({ events, count: events.length });
  } catch (err) {
    return NextResponse.json({ error: String(err), events: [] }, { status: 500 });
  }
}
