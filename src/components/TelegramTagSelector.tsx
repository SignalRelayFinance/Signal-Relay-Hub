'use client';
import React, { useState } from 'react';

const ALL_TAGS = ['product', 'regulatory', 'funding', 'pricing', 'security', 'partnership', 'talent', 'general'];

export default function TelegramTagSelector({ email, initialTags }: { email: string; initialTags: string[] }) {
  const [selected, setSelected] = useState<string[]>(initialTags);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(tag: string) {
    setSelected((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch('/api/telegram/tags', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, tags: selected }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="mt-3">
      <div className="text-sm text-neutral-600 mb-2">Choose which signal types to receive:</div>
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              selected.includes(tag)
                ? 'bg-black text-white border-black'
                : 'bg-transparent text-neutral-600 border-neutral-300 hover:border-neutral-500'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-3 rounded-md bg-black px-3 py-1.5 text-xs text-white hover:bg-black/90 disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save preferences'}
      </button>
    </div>
  );
}
