import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { messageId, event } = await req.json();

    if (!messageId || !event) {
      return NextResponse.json({ error: "Missing messageId or event" }, { status: 400 });
    }

    const now = new Date().toISOString();
    let updateData: any = {};

    switch (event) {
      case "delivered":
        updateData = { status: "delivered", delivered_at: now };
        break;
      case "opened":
        updateData = { status: "opened", opened_at: now };
        break;
      case "clicked":
        updateData = { status: "clicked", clicked_at: now };
        break;
      case "failed":
        updateData = { status: "failed" };
        break;
      default:
        return NextResponse.json({ warning: "Unknown event ignored" });
    }

    const { error } = await supabase
      .from("messages")
      .update(updateData)
      .eq("id", messageId);

    if (error) {
      console.error("Webhook Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
