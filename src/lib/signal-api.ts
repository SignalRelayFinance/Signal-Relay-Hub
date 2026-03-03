export type SignalEvent = {
  id: string;
  ts: string; // ISO
  source?: string;
  type: string;
  title?: string;
  body?: unknown;
};

export type DigestItem = {
  id: string;
  ts: string; // ISO
  title: string;
  summary: string;
  highlights?: string[];
};

const baseUrl = process.env.NEXT_PUBLIC_SIGNAL_API_BASE_URL?.replace(/\/$/, '') || '';

function url(path: string) {
  // If NEXT_PUBLIC_SIGNAL_API_BASE_URL is blank, we assume same-origin.
  return `${baseUrl}${path}`;
}

export async function fetchStatus() {
  const res = await fetch(url('/api/status'), { cache: 'no-store' });
  if (!res.ok) throw new Error(`status failed: ${res.status}`);
  return (await res.json()) as { ok: boolean; now: string };
}

export async function fetchEvents(params?: { limit?: number }) {
  const qp = new URLSearchParams();
  if (params?.limit) qp.set('limit', String(params.limit));
  const res = await fetch(url(`/api/events${qp.size ? `?${qp}` : ''}`), {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`events failed: ${res.status}`);
  return (await res.json()) as { events: SignalEvent[] };
}

export async function fetchDigest(params?: { limit?: number }) {
  const qp = new URLSearchParams();
  if (params?.limit) qp.set('limit', String(params.limit));
  const res = await fetch(url(`/api/digest${qp.size ? `?${qp}` : ''}`), {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`digest failed: ${res.status}`);
  return (await res.json()) as { digests: DigestItem[] };
}

export async function fetchHighlights() {
  const res = await fetch(url('/api/highlights'), { cache: 'no-store' });
  if (!res.ok) throw new Error(`highlights failed: ${res.status}`);
  return (await res.json()) as { highlights: string[] };
}
