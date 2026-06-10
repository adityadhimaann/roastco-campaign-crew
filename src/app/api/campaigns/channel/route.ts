import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { campaignId, channel } = await req.json();
    
    // Update all associated draft messages
    const { error: msgError } = await supabase.from('messages').update({ channel }).eq('campaign_id', campaignId).eq('status', 'pending');
    if (msgError) throw msgError;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating channel:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
