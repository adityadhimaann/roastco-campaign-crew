import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');
  const search = searchParams.get('search');

  let query = supabase
    .from('customers')
    .select(`*, orders(amount, ordered_at)`)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Supabase customers error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json({ customers: data });
}
