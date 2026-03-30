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

function isSupabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getSupabaseAdmin() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
  .select('id, company, source, title, link, summary, published, primary_tag, tags, sentiment, impact_score, confidence, fetched_at, created_at')
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
  return readJsonFile<StatusPayload>('status.json');
}
