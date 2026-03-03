import { fetchDigest } from '@/lib/signal-api';

export const dynamic = 'force-dynamic';

export default async function DigestArchivePage() {
  let digests: Awaited<ReturnType<typeof fetchDigest>>['digests'] = [];

  try {
    const d = await fetchDigest({ limit: 20 });
    digests = d.digests;
  } catch {
    // backend not wired yet
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Digest Archive</h1>
      <p className="mt-2 text-sm text-neutral-600">Pulling from /api/digest.</p>

      <div className="mt-6 space-y-3">
        {digests.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-neutral-600">No digests yet.</div>
        ) : (
          digests.map((d) => (
            <div key={d.id} className="rounded-md border p-4">
              <div className="text-xs text-neutral-500">{d.ts}</div>
              <div className="mt-1 font-medium">{d.title}</div>
              <div className="mt-2 text-sm text-neutral-700">{d.summary}</div>
              {d.highlights?.length ? (
                <ul className="mt-3 list-inside list-disc text-sm text-neutral-700">
                  {d.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
