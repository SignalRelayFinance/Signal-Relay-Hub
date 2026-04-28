/* eslint-disable react/no-unescaped-entities */
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

const CHANNEL_COLORS: Record<string, string> = {
  x: 'bg-white/10 text-white',
  telegram: 'bg-sky-500/20 text-sky-300',
  email: 'bg-purple-500/20 text-purple-300',
};

async function getQueue(): Promise<DripItem[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
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
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(status: DripItem['status']) {
  switch (status) {
    case 'sent':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'failed':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    default:
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }
}

export default async function SocialDripQueuePage() {
  const queue = await getQueue();
  const upcoming = queue.filter(i => i.status === 'queued').slice(0, 3);
  const sent = queue.filter(i => i.status === 'sent').length;
  const failed = queue.filter(i => i.status === 'failed').length;
  const queued = queue.filter(i => i.status === 'queued').length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Social Drip Queue</p>
        <h1 className="mt-3 text-3xl font-semibold">Schedule and broadcast your signals.</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Queue signal posts to go out on X, Telegram, or email at a specific time. Every drip item is stored in Supabase and picked up automatically by your automation workers.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-amber-300">Queued</div>
            <div className="mt-1 text-2xl font-bold text-white">{queued}</div>
            <p className="mt-0.5 text-xs text-white/50">Waiting to send</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald-300">Sent</div>
            <div className="mt-1 text-2xl font-bold text-white">{sent}</div>
            <p className="mt-0.5 text-xs text-white/50">Successfully delivered</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-rose-300">Failed</div>
            <div className="mt-1 text-2xl font-bold text-white">{failed}</div>
            <p className="mt-0.5 text-xs text-white/50">Delivery errors</p>
          </div>
        </div>
      </section>

      {/* Setup instructions */}
      <section className="rounded-3xl border border-sky-400/20 bg-sky-400/5 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-8 w-8 rounded-full bg-sky-400/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-sky-400 text-sm">📖</span>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white mb-1">How to set up your drip queue</h2>
            <p className="text-sm text-white/50 mb-6">New here? Follow these steps to get your first automated post scheduled and firing.</p>

            <div className="space-y-6">

              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-7 w-7 rounded-full bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-sky-400">1</span>
                  </div>
                  <div className="w-px flex-1 bg-white/10" />
                </div>
                <div className="pb-6">
                  <div className="text-sm font-semibold text-white mb-1">Connect your Telegram channel</div>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    The drip queue sends posts to your Telegram channel automatically. To connect it:
                  </p>
                  <ol className="space-y-2 text-sm text-white/50">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span>Open Telegram and search for <span className="font-mono text-white/70">@BotFather</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span>Send <span className="font-mono text-white/70">/newbot</span> and follow the prompts to create your bot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span>Copy your bot token — it looks like <span className="font-mono text-white/70">123456:ABC-DEF...</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span>Add your bot as an admin to your Telegram channel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span>Get your channel chat ID by messaging <span className="font-mono text-white/70">@userinfobot</span> or using the Telegram API</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span>Save your chat ID in your <a href="/settings" className="text-sky-400 hover:text-sky-300 underline">Account settings</a></span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-7 w-7 rounded-full bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-sky-400">2</span>
                  </div>
                  <div className="w-px flex-1 bg-white/10" />
                </div>
                <div className="pb-6">
                  <div className="text-sm font-semibold text-white mb-1">Schedule your first drip</div>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    Use the scheduler below to queue a post. Fill in:
                  </p>
                  <ol className="space-y-2 text-sm text-white/50">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span><span className="text-white/70 font-medium">Channel</span> — pick Telegram, X, or Email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span><span className="text-white/70 font-medium">Scheduled time</span> — pick the exact date and time to send</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                      <span><span className="text-white/70 font-medium">Message</span> — write your signal post. Keep X posts under 280 characters</span>
                    </li>
                  </ol>
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-xs text-white/40 leading-relaxed">
                      💡 <span className="text-white/60">Tip:</span> Copy a signal from the Live Feed, add your analysis, and schedule it for market open (8am London time for forex).
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-7 w-7 rounded-full bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-sky-400">3</span>
                  </div>
                  <div className="w-px flex-1 bg-white/10" />
                </div>
                <div className="pb-6">
                  <div className="text-sm font-semibold text-white mb-1">Set up your automation worker</div>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    The drip queue stores posts in Supabase. You need an automation tool to check the queue and send posts at the right time. Choose one:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 mb-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-semibold text-white mb-1">Zapier</div>
                      <p className="text-xs text-white/40 leading-relaxed">Use a scheduled Zap to poll your Supabase table every 15 mins and send queued posts via Telegram or email.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-semibold text-white mb-1">n8n</div>
                      <p className="text-xs text-white/40 leading-relaxed">Self-hosted option. Set a cron trigger to query Supabase for queued items and fire them via Telegram node.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-semibold text-white mb-1">GitHub Actions</div>
                      <p className="text-xs text-white/40 leading-relaxed">Free option. Set a cron workflow that hits your API endpoint every 15 mins to process the queue.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2">
                    <p className="text-xs text-amber-400/70 leading-relaxed">
                      ⚠️ Without an automation worker, posts will stay in the queue as "queued" and never send automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-7 w-7 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-emerald-400">4</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">Monitor your queue</div>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Once set up, come back here to check your queue status. Posts move from <span className="text-amber-400">queued</span> to <span className="text-emerald-400">sent</span> automatically. If something shows as <span className="text-rose-400">failed</span>, check your bot token and channel ID are correct in your account settings.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-white/50 px-1">Upcoming drips</div>
          {upcoming.length > 0 ? (
            upcoming.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs text-white/50">{formatDate(item.scheduled_at)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_COLORS[item.channel] ?? 'bg-white/10 text-white'}`}>
                      {CHANNEL_LABELS[item.channel] ?? item.channel}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{item.text}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-white">
              <p className="text-sm font-semibold">No upcoming drips</p>
              <p className="mt-2 text-sm text-white/50">Use the scheduler on the right to queue your first post.</p>
            </div>
          )}

          {queue.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="text-xs uppercase tracking-wide text-white/50">Full queue history</div>
              </div>
              <div className="divide-y divide-white/10">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="font-mono text-xs text-white/40 w-24 shrink-0">{formatDate(item.scheduled_at)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs shrink-0 ${CHANNEL_COLORS[item.channel] ?? 'bg-white/10 text-white'}`}>
                      {CHANNEL_LABELS[item.channel] ?? item.channel}
                    </span>
                    <span className="text-xs text-white/60 truncate flex-1">{item.text}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs capitalize shrink-0 ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-white/50 px-1">Schedule a drip</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 space-y-2 text-sm text-white/60">
              <p>Queue a signal or market update to post at a specific time. Supports:</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                  <div className="text-white text-xs font-medium">X / Twitter</div>
                  <div className="text-white/40 text-xs mt-0.5">280 chars</div>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2 text-center">
                  <div className="text-sky-300 text-xs font-medium">Telegram</div>
                  <div className="text-white/40 text-xs mt-0.5">4096 chars</div>
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-center">
                  <div className="text-purple-300 text-xs font-medium">Email</div>
                  <div className="text-white/40 text-xs mt-0.5">Unlimited</div>
                </div>
              </div>
            </div>
            <DripQueueForm />
          </div>
        </div>
      </div>
    </div>
  );
}
