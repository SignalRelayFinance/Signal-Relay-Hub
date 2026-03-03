export default function AccountSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Account Settings</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border p-4">
          <div className="font-medium">Plan</div>
          <div className="mt-1 text-sm text-neutral-600">Starter (MVP)</div>
          <a
            href="/api/stripe/checkout"
            className="mt-3 inline-flex rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-black/90"
          >
            Manage billing
          </a>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-medium">API Key</div>
          <div className="mt-1 text-sm text-neutral-600">(Provisioned after Stripe checkout)</div>
          <div className="mt-3 rounded bg-neutral-100 p-2 font-mono text-xs text-neutral-700">
            srh_live_********
          </div>
        </div>
      </div>
    </div>
  );
}
