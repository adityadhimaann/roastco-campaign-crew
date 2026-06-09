import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('status, sent_at, delivered_at, opened_at, clicked_at, campaign_id');

    if (messagesError) {
      console.error("Supabase Analytics Messages Error:", messagesError);
      return NextResponse.json({ error: messagesError }, { status: 500 });
    }

    const stats = {
      sent:      messages?.filter(m => m.sent_at).length ?? 0,
      delivered: messages?.filter(m => m.delivered_at).length ?? 0,
      opened:    messages?.filter(m => m.opened_at).length ?? 0,
      clicked:   messages?.filter(m => m.clicked_at).length ?? 0,
    };

    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (campaignsError) {
      console.error("Supabase Analytics Campaigns Error:", campaignsError);
      return NextResponse.json({ error: campaignsError }, { status: 500 });
    }

    return NextResponse.json({ stats, campaigns });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
