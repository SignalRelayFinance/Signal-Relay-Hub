import { DailyDigest, Highlight, SignalEvent, StatusPayload } from '@/lib/types';

const baseUrl = process.env.NEXT_PUBLIC_SIGNAL_API_BASE_URL?.replace(/\/$/, '') || '';

function url(path: string) {
  // If NEXT_PUBLIC_SIGNAL_API_BASE_URL is blank, we assume same-origin.
  return `${baseUrl}${path}`;
}

export async function fetchStatus() {
  const res = await fetch(url('/api/status'), { cache: 'no-store' });
  if (!res.ok) throw new Error(`status failed: ${res.status}`);
  return (await res.json()) as StatusPayload;
}

export async function fetchEvents(params?: { limit?: number; since?: string; tag?: string }) {
  const qp = new URLSearchParams();
  if (params?.limit) qp.set('limit', String(params.limit));
  if (params?.since) qp.set('since', params.since);
  if (params?.tag) qp.set('tag', params.tag);
  const res = await fetch(url(`/api/events${qp.size ? `?${qp}` : ''}`), {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`events failed: ${res.status}`);
  return (await res.json()) as { events: SignalEvent[]; next_cursor?: string };
}

export async function fetchDigest(params?: { date?: string }) {
  const qp = new URLSearchParams();
  if (params?.date) qp.set('date', params.date);
  const res = await fetch(url(`/api/digest${qp.size ? `?${qp}` : ''}`), {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`digest failed: ${res.status}`);
  return (await res.json()) as DailyDigest;
}

export async function fetchHighlights(params?: { limit?: number; min_score?: number }) {
  const qp = new URLSearchParams();
  if (params?.limit) qp.set('limit', String(params.limit));
  if (params?.min_score) qp.set('min_score', String(params.min_score));
  const res = await fetch(url(`/api/highlights${qp.size ? `?${qp}` : ''}`), { cache: 'no-store' });
  if (!res.ok) throw new Error(`highlights failed: ${res.status}`);
  return (await res.json()) as { highlights: Highlight[] };
}
