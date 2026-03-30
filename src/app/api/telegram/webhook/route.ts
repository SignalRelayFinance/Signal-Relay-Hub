import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const VALID_TAGS = ['product','regulatory','funding','pricing','security','partnership','talent','general'];

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });
  const message = body.message;
  if (!message) return NextResponse.json({ ok: true });
  const chatId = message.chat?.id;
  const text: string = message.text ?? '';
  if (!chatId) return NextResponse.json({ ok: true });

  if (text.startsWith('/connect')) {
    const email = text.split(' ')[1]?.trim().toLowerCase();
    if (!email) {
      await sendMessage(chatId, 'Please send your email like this:\n/connect you@example.com');
      return NextResponse.json({ ok: true });
    }
    const supabase = getServiceClient();
    const { error } = await supabase
      .from('profiles')
      .update({ telegram_chat_id: String(chatId) })
      .eq('email', email);
    if (error) {
      await sendMessage(chatId, 'Could not find that email. Make sure you have an active Signal Relay Hub subscription.');
    } else {
      await sendMessage(chatId, `Connected! You will now receive signal alerts here.\n\nTo choose which signals you receive, send:\n/tags product,regulatory,funding\n\nOr visit: signal-relay-hub-flsg.vercel.app/settings`);
    }
  } else if (text.startsWith('/tags')) {
    const tagInput = text.replace('/tags', '').trim();
    if (!tagInput) {
      await sendMessage(chatId, `Send your preferred tags like this:\n/tags product,regulatory,funding\n\nAvailable tags: ${VALID_TAGS.join(', ')}`);
      return NextResponse.json({ ok: true });
    }
    const tags = tagInput.split(',').map((t) => t.trim().toLowerCase()).filter((t) => VALID_TAGS.includes(t));
    if (tags.length === 0) {
      await sendMessage(chatId, `No valid tags found. Available: ${VALID_TAGS.join(', ')}`);
      return NextResponse.json({ ok: true });
    }
    const supabase = getServiceClient();
    const { error } = await supabase
      .from('profiles')
      .update({ telegram_tags: tags })
      .eq('telegram_chat_id', String(chatId));
    if (error) {
      await sendMessage(chatId, 'Could not update tags. Please try again.');
    } else {
      await sendMessage(chatId, `Updated! You will now receive alerts for: ${tags.join(', ')}`);
    }
  } else {
    await sendMessage(chatId, `Welcome to Signal Relay Hub alerts.\n\nTo connect your account, send:\n/connect you@example.com\n\nTo set your alert preferences, send:\n/tags product,regulatory,funding\n\nAvailable tags: ${VALID_TAGS.join(', ')}`);
  }

  return NextResponse.json({ ok: true });
}

async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}
