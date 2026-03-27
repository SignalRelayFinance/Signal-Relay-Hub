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
  since?: string;
  tag?: string;
};

export async function fetchEvents(options: FetchEventsOptions = {}): Promise<EventsPayload> {
  const { limit = 50, since, tag } = options;

  // Read from Supabase sf_events when configured
  if (isSupabaseConfigured()) {
    const admin = await getSupabaseAdmin();

    let query = admin
      .from('sf_events')
      .select('id, company, source, title, link, summary, published, primary_tag, tags, sentiment, impact_score, confidence, fetched_at, normalized_at, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tag) {
      query = query.eq('primary_tag', tag.toLowerCase());
    }

    if (since) {
      const sinceTimestamp = parseDateSafe(since);
      if (sinceTimestamp) {
        query = query.gte('created_at', new Date(sinceTimestamp).toISOString());
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fetchEvents error:', error);
      // Fall through to fixture on error
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

      return { events, next_cursor: null };
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

  // Read highlights from Supabase when configured
  if (isSupabaseConfigured()) {
    const admin = await getSupabaseAdmin();

    const query = admin
      .from('sf_events')
      .select('id, company, title, link, primary_tag, sentiment, impact_score')
      .order('impact_score', { ascending: false })
      .gte('impact_score', minScore ?? 4)
      .limit(limit);

    const { data, error } = await query;

    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        company: row.company,
        title: row.title,
        link: row.link,
        tag: row.primary_tag,
        sentiment: row.sentiment,
        score: row.impact_score,
      }));
    }
  }

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
