"use client";
import { useState } from 'react';

const CHANNELS = [
  { label: 'X / Twitter', value: 'x' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Email', value: 'email' },
];

const MAX_CHARS: Record<string, number> = {
  x: 280,
  telegram: 4096,
  email: 10000,
};

export function DripQueueForm() {
  const [channel, setChannel] = useState('x');
  const [when, setWhen] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxChars = MAX_CHARS[channel] ?? 280;
  const charsLeft = maxChars - text.length;
  const isOverLimit = charsLeft < 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!when || !text || isOverLimit) return;
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch('/api/drip-queue', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          channel,
          text,
          scheduledAt: new Date(when).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setStatus(data?.error ?? 'Failed to schedule');
      } else {
        setStatus('Scheduled successfully!');
        setText('');
        setWhen('');
      }
    } catch {
      setStatus('Failed to schedule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-white/50 mb-1.5 block">Channel</label>
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            {CHANNELS.map((option) => (
              <option key={option.value} value={option.value} className="bg-neutral-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-white/50 mb-1.5 block">When</label>
          <input
            type="datetime-local"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 [color-scheme:dark]"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs uppercase tracking-wide text-white/50">Copy</label>
          <span className={`text-xs font-mono ${isOverLimit ? 'text-rose-400' : charsLeft < 50 ? 'text-amber-400' : 'text-white/30'}`}>
            {charsLeft} chars left
          </span>
        </div>
        <textarea
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write your ${CHANNELS.find(c => c.value === channel)?.label} post here...`}
        />
      </div>

      <button
        type="submit"
        disabled={!when || !text || loading || isOverLimit}
        className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? 'Scheduling...' : 'Schedule drip'}
      </button>

      {status && (
        <div className={`rounded-xl border px-3 py-2 text-sm ${status.includes('success') ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
          {status}
        </div>
      )}
    </form>
  );
}
