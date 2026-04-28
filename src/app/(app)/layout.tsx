import { AuthProvider } from '@/components/auth-provider';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-neutral-950 text-white flex">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_50%)]" />
        <AppSidebar />
        <div className="flex flex-col flex-1 lg:ml-56 min-h-screen">
          <AppTopBar />
          <main className="flex-1 px-4 lg:px-8 py-6">
            <div className="mx-auto max-w-6xl space-y-6">
              {children}
            </div>
          </main>
          <footer className="border-t border-white/5 py-4 px-6 text-xs text-white/25">
            <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono">© 2026 Signal Relay Hub</span>
              <div className="flex flex-wrap gap-3">
                <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
                <a href="/disclaimer" className="hover:text-white/50 transition-colors">Disclaimer</a>
                <a href="/pricing" className="hover:text-white/50 transition-colors">Pricing</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </AuthProvider>
  );
}
