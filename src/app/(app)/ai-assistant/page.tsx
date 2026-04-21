/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';

const PAIRS = ['EURUSD', 'XAUUSD', 'BTCUSD', 'GBPUSD', 'USOIL', 'US30', 'ETHUSD'];

const QUICK_REPORTS = [
  { label: 'Full market analysis', prompt: (pair: string) => `Generate a comprehensive professional trading analysis report for ${pair}. Include: current market context, key support and resistance levels, trend analysis, momentum indicators assessment, fundamental drivers, AI trade direction prediction with entry zone, target and stop loss, key risks, and overall market outlook. Be specific with price levels based on current market prices.` },
  { label: 'Trade setup', prompt: (pair: string) => `Generate a specific trade setup for ${pair} right now. Include direction (long/short), exact entry zone, profit target, stop loss, risk/reward ratio, timeframe, and the key catalyst or reason for this setup. Be precise with price levels.` },
  { label: 'Risk assessment', prompt: (pair: string) => `Assess the current risk environment for trading ${pair}. What are the main downside risks, upcoming events that could cause volatility, correlation risks with other pairs, and what position sizing would you recommend?` },
  { label: 'Weekly outlook', prompt: (pair: string) => `Provide a weekly trading outlook for ${pair}. What are the key levels to watch this week, scheduled economic events that will impact price, likely price range, and the overall bias for the week?` },
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

function formatMessage(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('##')) return <h3 key={i} className="text-white font-semibold text-base mt-4 mb-2">{line.replace(/^##\s*/, '')}</h3>;
    if (line.startsWith('#')) return <h2 key={i} className="text-white font-bold text-lg mt-4 mb-2">{line.replace(/^#\s*/, '')}</h2>;
    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-white font-semibold mt-2">{line.replace(/\*\*/g, '')}</p>;
    if (line.startsWith('- ') || line.startsWith('• ')) return <li key={i} className="text-white/70 text-sm ml-4 mt-1">{line.replace(/^[-•]\s*/, '')}</li>;
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="text-white/80 text-sm mt-1 leading-relaxed">{line}</p>;
  });
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to your Elite AI Assistant. I can analyse any trading pair, generate trade setups, assess market risk, and answer your trading questions. Select a pair and use the quick report buttons, or ask me anything directly.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [loading, setLoading] = useState(false);
  const [isElite, setIsElite] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => {
      setIsElite(p.is_elite ?? false);
    }).catch(() => setIsElite(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;
    const userMessage: Message = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          pair: selectedPair,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  if (isElite === null) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isElite) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Elite feature</p>
          <h1 className="mt-3 text-3xl font-semibold">AI Trading Assistant</h1>
          <p className="mt-3 text-sm text-white/70">Get professional AI-powered market analysis, trade setups and answers to your trading questions.</p>
        </section>
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-8 text-white text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold mb-2">Elite members only</h2>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">The AI Trading Assistant is available exclusively to Elite subscribers. Get professional market analysis, trade setups with entry zones, targets and stop losses, and ask anything about market conditions.</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
              <div className="text-amber-400 font-bold text-sm">AI Reports</div>
              <div className="text-white/50 text-xs mt-0.5">Full pair analysis</div>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
              <div className="text-amber-400 font-bold text-sm">Trade Setups</div>
              <div className="text-white/50 text-xs mt-0.5">Entry, target, stop</div>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
              <div className="text-amber-400 font-bold text-sm">Risk Analysis</div>
              <div className="text-white/50 text-xs mt-0.5">Position sizing</div>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
              <div className="text-amber-400 font-bold text-sm">Q&A</div>
              <div className="text-white/50 text-xs mt-0.5">Ask anything</div>
            </div>
          </div>
          <a href="/pricing" className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-neutral-900 hover:bg-amber-300 transition-colors">
            Upgrade to Elite — £150/mo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-neutral-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400/70">Elite — AI Assistant</p>
            <h1 className="mt-2 text-2xl font-semibold">Trading AI Assistant</h1>
            <p className="mt-1 text-sm text-white/60">Professional market analysis, trade setups and real-time Q&A.</p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-white/50 mb-1">Active pair</div>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-300 focus:outline-none"
              >
                {PAIRS.map(p => <option key={p} value={p} className="bg-neutral-900 text-white">{p}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="text-xs text-white/40 w-full mb-1">Quick reports for {selectedPair}:</div>
          {QUICK_REPORTS.map((report) => (
            <button
              key={report.label}
              onClick={() => sendMessage(report.prompt(selectedPair))}
              disabled={loading}
              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-400/20 transition-colors disabled:opacity-50"
            >
              {report.label}
            </button>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden flex flex-col" style={{ height: '60vh' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${message.role === 'user' ? 'bg-amber-400/20 border border-amber-400/30' : 'bg-white/5 border border-white/10'}`}>
                {message.role === 'assistant' ? (
                  <div className="space-y-1">
                    {formatMessage(message.content)}
                  </div>
                ) : (
                  <p className="text-sm text-white">{message.content}</p>
                )}
                <div className="text-xs text-white/30 mt-2">
                  {message.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={`Ask about ${selectedPair} or any market question...`}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/40"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-amber-300 transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">Press Enter to send · Select a pair above for context-aware analysis</p>
        </div>
      </div>
    </div>
  );
}
