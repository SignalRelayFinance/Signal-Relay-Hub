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
    <div>
      <h1 className="text-2xl font-semibold">Social Drip Queue</h1>
      <p className="mt-2 text-sm text-neutral-600">Simple MVP table (wire to backend later).</p>

      <div className="mt-6 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Channel</th>
              <th className="px-3 py-2">Text</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs text-neutral-600">{x.when}</td>
                <td className="px-3 py-2">{x.channel}</td>
                <td className="px-3 py-2">{x.text}</td>
                <td className="px-3 py-2">{x.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
