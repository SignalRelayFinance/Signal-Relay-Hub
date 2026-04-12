import fs from 'node:fs/promises';
import path from 'node:path';
import { DailyDigest, EventsPayload, Highlight, HighlightsPayload, StatusPayload } from './types';

const defaultSampleDir = path.join(process.cwd(), 'docs', 'payload-examples');

function resolveSampleDir() {
  return process.env.SIGNAL_SAMPLE_DIR
    ? path.resolve(process.env.SIGNAL_SAMPLE_DIR)
    : defaultSampleDir;
}

async function readJsonFile<T>(fileName: string): Promise<T> {
  const sampleDir = resolveSampleDir();
  const filePath = path.join(sampleDir, fileName);
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file) as T;
}

function parseDateSafe(value?: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function isSupabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!getSupabaseServiceKey()
  );
}

async function getSupabaseAdmin() {
  const { createClient } = await import('@supabase/supabase-js');
  const serviceKey = getSupabaseServiceKey();
  if (!serviceKey) {
    throw new Error('Supabase service key missing');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );
}

export type FetchEventsOptions = {
  limit?: number;
  offset?: number;
  since?: string;
  tag?: string;
};

export async function fetchEvents(options: FetchEventsOptions = {}): Promise<EventsPayload> {
  const { limit = 50, since, tag } = options;

  if (isSupabaseConfigured()) {
    const admin = await getSupabaseAdmin();
    const sinceTimestamp = parseDateSafe(since);

   const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const baseQuery = admin
  .from('sf_events')
 .select('id, company, source, title, link, summary, published, primary_tag, tags, sentiment, impact_score, confidence, fetched_at, created_at, pairs_analysis, event_type, currency, impact, impact_color, forecast, previous_value, actual_value')
  .gte('created_at', thirtyDaysAgo.toISOString())
  .order('created_at', { ascending: false })
  .limit(limit);

    const taggedQuery = tag ? baseQuery.eq('primary_tag', tag.toLowerCase()) : baseQuery;
    const finalQuery = sinceTimestamp
      ? taggedQuery.gte('created_at', new Date(sinceTimestamp).toISOString())
      : taggedQuery;

    const { data, error } = await finalQuery;

    if (error) {
      console.error('Supabase fetchEvents error:', error);
    } else {
      const events = (data ?? []).map((row) => ({
        id: row.id,
        company: row.company,
        source: row.source,
        source_url: row.link,
        title: row.title,
        link: row.link,
        summary: row.summary,
        published_at: row.published,
        primary_tag: row.primary_tag,
        tags: row.tags ?? [],
        sentiment: row.sentiment,
        impact_score: row.impact_score,
        confidence: row.confidence,
        fetched_at: row.fetched_at ?? row.created_at,
       pairs_analysis: row.pairs_analysis ?? null,
        event_type: row.event_type ?? null,
        currency: row.currency ?? null,
        impact: row.impact ?? null,
        impact_color: row.impact_color ?? null,
        forecast: row.forecast ?? null,
        previous_value: row.previous_value ?? null,
        actual_value: row.actual_value ?? null,
      }));
      return { events, next_cursor: undefined };
    }
  }

  // Fallback: fixture file
  const payload = await readJsonFile<EventsPayload>('events.json');
  let events = payload.events ?? [];

  const sinceTimestamp = parseDateSafe(since);
  if (sinceTimestamp) {
    events = events.filter((event) => {
      const eventTimestamp = parseDateSafe(event.fetched_at) ?? parseDateSafe(event.published_at);
      return eventTimestamp ? eventTimestamp >= sinceTimestamp : true;
    });
  }

  if (tag) {
    const target = tag.toLowerCase();
    events = events.filter((event) => {
      const primary = event.primary_tag?.toLowerCase();
      const tags = event.tags?.map((t) => t.toLowerCase()) ?? [];
      return primary === target || tags.includes(target);
    });
  }

  return {
    events: events.slice(0, limit),
    next_cursor: payload.next_cursor,
  } satisfies EventsPayload;
}

export async function fetchDigest(date?: string): Promise<DailyDigest> {
  if (date) {
    const datedFile = `digest-${date}.json`;
    try {
      return await readJsonFile<DailyDigest>(datedFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  return readJsonFile<DailyDigest>('digest.json');
}

export type FetchHighlightsOptions = {
  limit?: number;
  minScore?: number;
};

export async function fetchHighlights(
  options: FetchHighlightsOptions = {},
): Promise<Highlight[]> {
  const { limit = 5, minScore } = options;

  const payload = await readJsonFile<HighlightsPayload>('highlights.json');
  let highlights = payload.highlights ?? [];
  if (typeof minScore === 'number') {
    highlights = highlights.filter((highlight) => highlight.score >= minScore);
  }
  return highlights.slice(0, limit);
}

export async function fetchStatus(): Promise<StatusPayload> {
  if (isSupabaseConfigured()) {
    const fromSupabase = await fetchStatusFromSupabase();
    if (fromSupabase) return fromSupabase;
  }
  return readJsonFile<StatusPayload>('status.json');
}

async function fetchStatusFromSupabase(): Promise<StatusPayload | null> {
  try {
    const admin = await getSupabaseAdmin();
    const now = Date.now();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    const dbLatencyStart = Date.now();

    const [secLatest, rssLatest, totalCount, secCount, queueCount] = await Promise.all([
      admin
        .from('sf_events')
        .select('created_at')
        .ilike('source', '%sec%')
        .order('created_at', { ascending: false })
        .limit(1),
      admin
        .from('sf_events')
        .select('created_at')
        .not('source', 'ilike', '%sec%')
        .order('created_at', { ascending: false })
        .limit(1),
      admin
        .from('sf_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo),
      admin
        .from('sf_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)
        .eq('primary_tag', 'regulatory'),
      admin
        .from('drip_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'queued'),
    ]);

    const latencyMs = Math.max(1, Date.now() - dbLatencyStart);

    const secLast = secLatest.data?.[0]?.created_at ?? null;
    const rssLast = rssLatest.data?.[0]?.created_at ?? null;
    const total24 = totalCount.count ?? 0;
    const sec24 = secCount.count ?? 0;
    const rss24 = Math.max(total24 - sec24, 0);
    const queuedDrips = queueCount.count ?? 0;
    const lastDigest = secLast ?? rssLast ?? new Date(now).toISOString();

    return {
      collectors: {
        flash_sec: {
          last_run: secLast ?? 'unknown',
          success: true,
          new_records: sec24,
        },
        signal_foundry: {
          last_run: rssLast ?? 'unknown',
          success: true,
          new_records: rss24,
        },
      },
      notifier: {
        last_digest: lastDigest,
        telegram: queuedDrips > 0 ? 'queued' : 'sent',
        email: total24 > 0 ? 'sent' : 'queued',
        last_error: null,
        queued_drips: queuedDrips,
      },
      database: {
        status: 'healthy',
        latency_ms: latencyMs,
      },
    } satisfies StatusPayload;
  } catch (error) {
    console.error('fetchStatusFromSupabase failed', error);
    return null;
  }
}
