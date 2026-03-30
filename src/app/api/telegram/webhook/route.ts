import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  // User sends /connect <email> to link their account
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
      await sendMessage(chatId, `Connected! You will now receive signal alerts here.\n\nTo choose which signals you receive, visit your account settings at signal-relay-hub-flsg.vercel.app/settings`);
    }
  } else {
    await sendMessage(chatId, 'Welcome to Signal Relay Hub alerts.\n\nTo connect your account, send:\n/connect you@example.com');
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
