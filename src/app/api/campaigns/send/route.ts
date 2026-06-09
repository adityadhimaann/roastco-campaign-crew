import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // Fetch messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*, customers(name, email, phone)')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Fire messages
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

    return NextResponse.json({ success: true, count: messages.length });
  } catch (err) {
    console.error("Send API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
