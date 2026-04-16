'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/feed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div className="text-center space-y-6">
        <div className="text-6xl">✅</div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Email verified</h1>
          <p className="mt-2 text-white/60 text-sm">Signing you in to Signal Relay Hub...</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 inline-block">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Redirecting in</div>
          <div className="text-3xl font-bold text-white">{countdown}</div>
        </div>
        <p className="text-xs text-white/30">Taking too long? <a href="/feed" className="text-sky-400 hover:underline">Click here</a></p>
      </div>
    </div>
  );
}
