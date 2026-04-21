/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';

const PAIRS = ['EURUSD', 'XAUUSD', 'BTCUSD', 'GBPUSD', 'USOIL', 'US30', 'ETHUSD'];

const QUICK_REPORTS = [
  {
    label: 'Full Analysis',
    color: 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20',
    prompt: (pair: string) => `Generate a comprehensive professional trading analysis report for ${pair}. Structure your response with these clear sections:

## Market Overview
Current price context and recent price action.

## Technical Analysis
Key support and resistance levels with exact prices. Trend direction. Momentum assessment.

## Fundamental Drivers
What news, economic events or signals are currently driving this pair.

## Trade Direction
Clear bias — LONG or SHORT — with reasoning.

## Trade Setup
- Direction: LONG or SHORT
- Entry Zone: specific price range
- Target 1: first profit target
- Target 2: extended target
- Stop Loss: exact price
- Risk/Reward: ratio
- Timeframe: how long to hold

## Key Risks
What could invalidate this trade.

## Verdict
One clear sentence — what should a trader do right now.

Be specific with all price levels based on the current live price provided.`
  },
  {
    label: 'Scalp Setup',
    color: 'border-sky-400/30 bg-sky-400/10 text-sky-300 hover:bg-sky-400/20',
    prompt: (pair: string) => `Generate a short-term scalping trade setup for ${pair} right now. Focus on:

## Scalp Direction
LONG or SHORT with clear reason.

## Entry
Exact entry price or tight range (within 5-10 pips/points of current price).

## Targets
- Target 1: first exit (5-15 pips)
- Target 2: extended target (15-30 pips)

## Stop Loss
Tight stop (5-10 pips max).

## Timeframe
1-15 minute chart setup.

## Key Level
The specific support/resistance or order flow reason for this scalp.

## Risk/Reward
Minimum 1:1.5 required — state the ratio.

Be very specific with price levels. This is for immediate execution.`
  },
  {
    label: 'Swing Trade',
    color: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20',
    prompt: (pair: string) => `Generate a swing trade setup for ${pair} targeting a 1-5 day hold. Include:

## Swing Direction
LONG or SHORT with macro reasoning.

## Entry Strategy
- Ideal entry zone
- Alternative entry on pullback
- What to wait for before entering

## Profit Targets
- Target 1: conservative (50-100 pips)
- Target 2: extended (100-200+ pips)

## Stop Loss
Where the trade is invalidated.

## Hold Period
Expected time to target.

## Key Events This Week
Economic events that could impact this swing.

## Position Sizing
Suggested risk percentage per trade.`
  },
  {
    label: 'Risk Report',
    color: 'border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20',
    prompt: (pair: string) => `Generate a risk assessment report for ${pair}. Include:

## Current Risk Level
Low / Medium / High — with explanation.

## Key Risk Factors
What could cause sharp adverse moves.

## Upcoming Events
Economic releases or central bank events this week that could spike volatility.

## Correlation Risks
How this pair correlates with other markets right now.

## Avoid Trading If
Specific conditions where this pair should not be traded.

## Position Sizing Recommendation
Based on current volatility, what % of account to risk per trade.

## Overall Verdict
Trade with caution, avoid, or good conditions to trade.`
  },
  {
    label: 'Weekly Outlook',
    color: 'border-purple-400/30 bg-purple-400/10 text-purple-300 hover:bg-purple-400/20',
    prompt: (pair: string) => `Provide a weekly trading outlook for ${pair}. Include:

## Weekly Bias
Bullish, Bearish or Ranging — with key reason.

## Key Levels This Week
- Major resistance levels
- Major support levels
- Weekly pivot point

## Economic Calendar
Key events this week that will impact ${pair}.

## Price Range Estimate
Expected high and low range for the week.

## Best Trading Days
Which days this week offer the best setups and why.

## Strategy
Recommended approach for the week — buy dips, sell rallies, or range trade.`
  },
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

function formatMessage(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} className="mt-4 mb-2 pb-1 border-b border-white/10">
          <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wide">{line.replace(/^##\s*/, '')}</h3>
        </div>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-white font-bold text-base mt-4 mb-2">{line.replace(/^#\s*/, '')}</h2>
      );
    } else if (line.includes('LONG') && !line.startsWith('-')) {
      elements.push(
        <p key={i} className="text-emerald-400 font-bold text-sm mt-1">{formatInline(line)}</p>
      );
    } else if (line.includes('SHORT') && !line.startsWith('-')) {
      elements.push(
        <p key={i} className="text-rose-400 font-bold text-sm mt-1">{formatInline(line)}</p>
      );
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const text = line.replace(/^[-•]\s*/, '');
      const isPositive = text.toLowerCase().includes('target') || text.toLowerCase().includes('long');
      const isNegative = text.toLowerCase().includes('stop') || text.toLowerCase().includes('risk') || text.toLowerCase().includes('short');
      elements.push(
        <div key={i} className="flex items-start gap-2 mt-1">
          <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${isPositive ? 'bg-emerald-400' : isNegative ? 'bg-rose-400' : 'bg-amber-400'}`} />
          <p className="text-white/80 text-sm">{formatInline(text)}</p>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="text-white/75 text-sm mt-1 leading-relaxed">{formatInline(line)}</p>
      );
    }
    i++;
  }
  return elements;
}

function formatInline(text: string): any {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `## Welcome to your Elite AI Trading Assistant

I have access to real-time market prices and Signal Relay Hub's live signal feed.

I can help you with:
- **Full market analysis** — comprehensive breakdown of any pair
- **Scalp setups** — immediate short-term trade opportunities
- **Swing trades** — 1-5 day position ideas
- **Risk reports** — volatility and risk assessment
- **Weekly outlook** — what to expect this week

Select your pair above and use the quick report buttons, or ask me anything directly.`,
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
          <p className="mt-3 text-sm text-white/70">Professional AI-powered market analysis, trade setups and real-time Q&A.</p>
        </section>
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-8 text-white text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold mb-2">Elite members only</h2>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Get professional scalp setups, swing trades, full market analysis and risk reports — powered by real-time prices and live signal data.</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
            {[
              { label: 'Scalp Setups', sub: '1-15 min trades' },
              { label: 'Swing Trades', sub: '1-5 day positions' },
              { label: 'Full Analysis', sub: 'Complete breakdown' },
              { label: 'Risk Reports', sub: 'Position sizing' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
                <div className="text-amber-400 font-bold text-sm">{item.label}</div>
                <div className="text-white/50 text-xs mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
          <a href="/pricing" className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-neutral-900 hover:bg-amber-300 transition-colors">
            Upgrade to Elite
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
            <p className="mt-1 text-sm text-white/60">Real-time prices · Live signal data · Professional analysis</p>
          </div>
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
        <div className="mt-4">
          <div className="text-xs text-white/40 mb-2">Quick reports for {selectedPair}:</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPORTS.map((report) => (
              <button
                key={report.label}
                onClick={() => sendMessage(report.prompt(selectedPair))}
                disabled={loading}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${report.color}`}
              >
                {report.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden flex flex-col" style={{ height: '65vh' }}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Live prices active · {selectedPair} selected</span>
          </div>
          <button
            onClick={() => setMessages([{
              role: 'assistant',
              content: 'Chat cleared. Ask me anything or use the quick reports above.',
              timestamp: new Date(),
            }])}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Clear chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl p-4 ${message.role === 'user' ? 'bg-amber-400/20 border border-amber-400/30' : 'bg-white/5 border border-white/10'}`}>
                {message.role === 'assistant' ? (
                  <div>{formatMessage(message.content)}</div>
                ) : (
                  <p className="text-sm text-white">{message.content}</p>
                )}
                <div className="text-xs text-white/25 mt-3">
                  {message.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/40 mr-1">Analysing</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4 bg-white/[0.02]">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={`Ask about ${selectedPair}...`}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/40 transition-colors"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-neutral-900 hover:bg-amber-300 transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-white/25">Press Enter to send</p>
            <p className="text-xs text-white/25">Not financial advice — for educational purposes only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
