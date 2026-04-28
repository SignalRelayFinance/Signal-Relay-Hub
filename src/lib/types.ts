export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface PairImpact {
  pair: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: 1 | 2 | 3;
  reason: string;
}

export interface PairsAnalysis {
  pairs: PairImpact[];
  overall: string;
}

export interface TradeSetup {
  pair: string;
  direction: 'long' | 'short';
  conviction: 'high' | 'medium' | 'low';
  entry_zone: string;
  target: string;
  stop_loss: string;
  timeframe: string;
  thesis: string;
  key_risks: string;
}

export interface TradePrediction {
  trades: TradeSetup[];
  market_summary: string;
  do_not_trade: string;
  confidence_score?: number;
  corroborating_signals?: number;
}

export interface SignalEvent {
  id: string;
  company: string;
  source: string;
  source_url: string;
  title: string;
  summary: string;
  tags: string[];
  primary_tag: string;
  impact_score: number;
  sentiment: Sentiment;
  fetched_at: string;
  published_at: string;
  pairs_analysis?: PairsAnalysis | null;
  trade_prediction?: TradePrediction | null;
}

export interface EventsPayload {
  events: SignalEvent[];
  next_cursor?: string;
}

export interface DigestEvent {
  company: string;
  primary_tag: string;
  impact_score: number;
  title: string;
  link: string;
}

export interface DigestFiling {
  ticker: string;
  form_type: string;
  score: number;
  filing_url: string;
}

export interface DailyDigest {
  date: string;
  markdown: string;
  events: DigestEvent[];
  filings: DigestFiling[];
}

export interface Highlight {
  ticker: string;
  title: string;
  catalyst: string;
  score: number;
  summary: string;
  link: string;
  suggested_copy: string;
}

export interface HighlightsPayload {
  highlights: Highlight[];
}

export interface CollectorStatus {
  last_run: string;
  success: boolean;
  new_records: number;
  latency_ms?: number;
}

export interface NotifierStatus {
  last_digest: string;
  telegram: 'sent' | 'queued' | 'failed' | 'skipped';
  email: 'sent' | 'queued' | 'failed' | 'skipped';
  last_error: string | null;
  queued_drips?: number;
}

export interface DatabaseStatus {
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
}

export interface StatusPayload {
  collectors: Record<string, CollectorStatus>;
  notifier: NotifierStatus;
  database: DatabaseStatus;
}
