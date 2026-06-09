import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Idempotency: track processed events
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  try {
    const { messageId, event } = await req.json();

    // Idempotency check
    const eventKey = `${messageId}:${event}`;
    if (processedEvents.has(eventKey)) {
      return NextResponse.json({ status: 'duplicate' });
    }
    processedEvents.add(eventKey);

    // Map event to column
    const columnMap: Record<string, string> = {
      delivered: 'delivered_at',
      opened:    'opened_at',
      clicked:   'clicked_at',
      failed:    'status'
    };

    const updateData: Record<string, any> =
      event === 'failed'
        ? { status: 'failed' }
        : {
            status: event,
            [columnMap[event]]: new Date().toISOString()
          };

    const { error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', messageId);

    if (error) {
      console.error("Supabase message update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error("Receipt API Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
