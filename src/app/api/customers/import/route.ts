import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { customers } = await req.json();

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: "Invalid or empty customer data" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("customers")
      .insert(customers)
      .select();

    if (error) {
      console.error("Failed to import customers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0 });
  } catch (err: any) {
    console.error("Import API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
