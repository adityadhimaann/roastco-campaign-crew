import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*, messages(id)')
      .order('created_at', { ascending: false })
      .limit(5);

    const campaigns = campaignsData?.map(c => ({
      ...c,
      audience_count: c.messages?.length || 0
    })) || [];

    if (campaignsError) {
      console.error("Supabase Analytics Campaigns Error:", campaignsError);
      return NextResponse.json({ error: campaignsError }, { status: 500 });
    }

    // Generate last 7 days lineData
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        dateString: d.toISOString().split('T')[0], 
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        Sent: 0, 
        Delivered: 0, 
        Opened: 0 
      };
    });

    messages?.forEach(m => {
      if (!m.sent_at) return;
      const dateStr = new Date(m.sent_at).toISOString().split('T')[0];
      const dayData = last7Days.find(d => d.dateString === dateStr);
      if (dayData) {
        dayData.Sent++;
        if (m.delivered_at) dayData.Delivered++;
        if (m.opened_at) dayData.Opened++;
      }
    });

    return NextResponse.json({ stats, campaigns, lineData: last7Days });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
