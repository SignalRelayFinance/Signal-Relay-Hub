"use client";

import { useState } from 'react';

const CHANNELS = [
  { label: 'X / Twitter', value: 'x' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Email', value: 'email' },
];

export function DripQueueForm() {
  const [channel, setChannel] = useState('x');
  const [when, setWhen] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!when || !text) return;
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
        setStatus('Scheduled!');
        setText('');
      }
    } catch {
      setStatus('Failed to schedule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white p-5 shadow">
      <div className="text-xs uppercase tracking-wide text-neutral-500">Schedule a drip</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-neutral-600">
          Channel
          <select
            className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            {CHANNELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-neutral-600">
          When
          <input
            type="datetime-local"
            className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </label>
      </div>
      <label className="mt-4 block text-sm text-neutral-600">
        Copy
        <textarea
          className="mt-2 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the snippet you want to schedule"
        />
      </label>
      <button
        type="submit"
        disabled={!when || !text || loading}
        className="mt-4 w-full rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Scheduling…' : 'Schedule drip'}
      </button>
      {status && <div className="mt-3 text-sm text-neutral-500">{status}</div>}
    </form>
  );
}
