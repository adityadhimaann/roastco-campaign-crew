import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, messages(content, channel)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error }, { status: 500 });

  // Map to just return the first message details to the frontend
  const campaigns = data.map((c: any) => ({
    ...c,
    preview_message: c.messages?.[0]?.content || "No message",
    channel: c.messages?.[0]?.channel || "Unknown",
    audience_count: c.messages?.length || 0
  }));

  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, goal, segment_filters, messages, draft } = body;

    // 1. Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({ 
        name, 
        goal, 
        segment_filters, 
        status: draft ? 'draft' : 'sending'
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase campaign insert error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    // 2. Insert all messages
    const messageRows = messages.map((m: any) => ({
      campaign_id: campaign.id,
      customer_id: m.customer_id,
      content: m.content,
      channel: m.channel,
      status: 'pending'
    }));

    const { error: msgError } = await supabase.from('messages').insert(messageRows);
    if (msgError) {
      console.error("Supabase messages insert error:", msgError);
      return NextResponse.json({ error: msgError }, { status: 500 });
    }

    // 3. Fire and forget — send to channel service (if not draft)
    if (!draft) {
      fireMessages(campaign.id);
    }

    return NextResponse.json({ campaign });
  } catch (err) {
    console.error("Campaign POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function fireMessages(campaignId: string) {
  const { data: messages } = await supabase
    .from('messages')
    .select('*, customers(name, email, phone)')
    .eq('campaign_id', campaignId);

  if (!messages) return;

  for (const msg of messages) {
    // Mark as sent
    await supabase
      .from('messages')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', msg.id);

    // Call channel service
    await fetch(`${process.env.CHANNEL_SERVICE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: msg.id,
        recipient: msg.customers,
        content: msg.content,
        channel: msg.channel,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/receipt`
      })
    }).catch(console.error);
  }
}
