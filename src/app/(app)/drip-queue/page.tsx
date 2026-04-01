type DripItem = {
  id: string;
  when: string;
  channel: 'x' | 'telegram' | 'email';
  text: string;
  status: 'queued' | 'sent' | 'failed';
};

const mock: DripItem[] = [
  {
    id: 'dq_1',
    when: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    channel: 'x',
    text: 'New SEC filing signal: competitor increased R&D spend 3x QoQ.',
    status: 'queued',
  },
  {
    id: 'dq_2',
    when: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    channel: 'telegram',
    text: 'Digest: Top 5 competitive signals today (with links).',
    status: 'queued',
  },
];

export default function SocialDripQueuePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Drip queue</p>
        <h1 className="mt-3 text-3xl font-semibold">Schedule social summaries straight from the signal stream.</h1>
        <p className="mt-3 text-sm text-white/70">
          Wire this MVP table to your automation service later. For now, preview how SEC alerts and
          competitive signals would drip to X, Telegram, and email.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {mock.map((item) => (
          <div key={item.id} className="rounded-3xl border border-white/10 bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-neutral-500">{new Date(item.when).toLocaleString()}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  item.channel === 'x'
                    ? 'bg-sky-100 text-sky-700'
                    : item.channel === 'telegram'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {item.channel}
              </span>
            </div>
            <p className="mt-3 text-sm text-neutral-800">{item.text}</p>
            <div className="mt-4 text-xs text-neutral-500">
              Status:{' '}
              <span
                className={`font-medium ${
                  item.status === 'queued'
                    ? 'text-amber-600'
                    : item.status === 'sent'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Copy</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((x) => (
              <tr key={x.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{new Date(x.when).toLocaleString()}</td>
                <td className="px-4 py-3 text-neutral-700 capitalize">{x.channel}</td>
                <td className="px-4 py-3 text-neutral-800">{x.text}</td>
                <td className="px-4 py-3 text-neutral-700 capitalize">{x.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
