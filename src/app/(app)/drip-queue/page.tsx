import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { DripQueueForm } from '@/components/drip-queue-form';

export const dynamic = 'force-dynamic';

type DripItem = {
  id: string;
  scheduled_at: string;
  channel: 'x' | 'telegram' | 'email';
  text: string;
  status: 'queued' | 'sent' | 'failed';
};

const CHANNEL_LABELS: Record<string, string> = {
  x: 'X / Twitter',
  telegram: 'Telegram',
  email: 'Email',
};

async function getQueue(): Promise<DripItem[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data } = await supabase
    .from('drip_queue')
    .select('id, scheduled_at, channel, text, status')
    .order('scheduled_at', { ascending: true });

  return (data ?? []) as DripItem[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClasses(status: DripItem['status']) {
  switch (status) {
    case 'sent':
      return 'text-emerald-600';
    case 'failed':
      return 'text-rose-600';
    default:
      return 'text-amber-600';
  }
}

export default async function SocialDripQueuePage() {
  const queue = await getQueue();
  const upcoming = queue.slice(0, 2);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Drip queue</p>
        <h1 className="mt-3 text-3xl font-semibold">
          Broadcast SEC + competitive digests straight to X, Telegram, or email.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Every drip item stays in Supabase so your automation workers (Zapier, n8n, custom bots)
          can pick them up and publish on schedule. Queue new items below and
          monitor what is going out next.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {upcoming.length > 0 ? (
            upcoming.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-white p-5 shadow">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                  <span className="font-mono">{formatDate(item.scheduled_at)}</span>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700">
                    {CHANNEL_LABELS[item.channel] ?? item.channel}
                  </span>
                </div>
                <p className="mt-3 text-sm text-neutral-800">{item.text}</p>
                <div className={`mt-4 text-xs font-semibold ${statusClasses(item.status)}`}>
                  Status: {item.status}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-white">
              <p className="text-sm font-semibold">No upcoming drips yet</p>
              <p className="mt-2 text-sm text-white/70">
                Use the scheduler to add your first post. New entries appear here automatically.
              </p>
            </div>
          )}
        </div>
        <DripQueueForm />
      </section>

      <section className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow">
        {queue.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-500">
            Nothing queued. Add an item to see it appear here.
          </div>
        ) : (
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
              {queue.map((item) => (
                <tr key={item.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{formatDate(item.scheduled_at)}</td>
                  <td className="px-4 py-3 text-neutral-700">{CHANNEL_LABELS[item.channel] ?? item.channel}</td>
                  <td className="px-4 py-3 text-neutral-800">{item.text}</td>
                  <td className={`px-4 py-3 text-neutral-700 capitalize ${statusClasses(item.status)}`}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
