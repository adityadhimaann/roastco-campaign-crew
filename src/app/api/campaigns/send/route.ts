import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    // 1. Update campaign status
    const { error } = await supabase
      .from("campaigns")
      .update({ status: "running" })
      .eq("id", campaignId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Fetch all messages for this campaign
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("campaign_id", campaignId);

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: true, warning: "No messages found" });
    }

    // Fetch customer names to send to channel service
    const customerIds = messages.map(m => m.customer_id);
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name")
      .in("id", customerIds);
    
    const customerMap = new Map(customers?.map(c => [c.id, c.name]));

    // 3. Update sent_at timestamp
    const now = new Date().toISOString();
    await supabase
      .from("messages")
      .update({ sent_at: now, status: "sent" })
      .eq("campaign_id", campaignId);

    // 4. Dispatch to channel service
    const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || "http://localhost:3001";
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Send asynchronously so we don't block the request for huge lists
    Promise.all(messages.map(async (msg) => {
      try {
        const customerName = customerMap.get(msg.customer_id) || msg.customer_id;
        await fetch(`${CHANNEL_SERVICE_URL}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId: msg.id,
            recipient: customerName,
            content: msg.content,
            channel: msg.channel,
            callbackUrl: `${APP_URL}/api/webhooks/delivery`
          })
        });
      } catch (err) {
        console.error("Failed to queue message to channel service:", err);
      }
    }));

    return NextResponse.json({ success: true, queued: messages.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
