import { fetchDigest } from '@/lib/signal-api';
import type { DailyDigest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DigestArchivePage() {
  let digest: DailyDigest | null = null;

  try {
    digest = await fetchDigest();
  } catch {
    // backend not wired yet
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Digest Archive</h1>
      <p className="mt-2 text-sm text-neutral-600">Pulling from /api/digest (Markdown + JSON).</p>

      {!digest ? (
        <div className="mt-6 rounded-md border p-4 text-sm text-neutral-600">No digests yet.</div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="rounded-md border p-4">
            <div className="text-xs text-neutral-500">{digest.date}</div>
            <div className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{digest.markdown}</div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Featured Events</h2>
            <div className="mt-3 space-y-3">
              {digest.events.map((event, idx) => (
                <div key={`${event.company}-${idx}`} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span>{event.company}</span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600">
                      {event.primary_tag}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                      Impact {event.impact_score}
                    </span>
                  </div>
                  <div className="mt-1 font-medium">{event.title}</div>
                  <a
                    href={event.link}
                    className="mt-2 inline-flex text-sm text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Filings</h2>
            <div className="mt-3 overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-left">
                  <tr>
                    <th className="px-3 py-2">Ticker</th>
                    <th className="px-3 py-2">Form</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {digest.filings.map((filing) => (
                    <tr key={`${filing.ticker}-${filing.form_type}`} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs text-neutral-600">{filing.ticker}</td>
                      <td className="px-3 py-2">{filing.form_type}</td>
                      <td className="px-3 py-2">{filing.score}</td>
                      <td className="px-3 py-2">
                        <a
                          href={filing.filing_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
