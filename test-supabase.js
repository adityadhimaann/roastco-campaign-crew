import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log("Connecting to Supabase at: " + process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { data, error } = await supabase.from('customers').select('*').limit(3);
  
  if (error) {
    console.error("\n❌ SUPABASE ERROR:");
    console.error(error.message);
  } else {
    console.log("\n✅ SUPABASE CONNECTED SUCCESSFULLY!");
    console.log("Found " + data.length + " customers. Here is a sample:");
    console.log(JSON.stringify(data, null, 2));
  }
}

testConnection();
