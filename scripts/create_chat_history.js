const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { error } = await supabase.rpc('execute_sql', {
    sql_string: `
      create table if not exists chat_history (
        id uuid primary key default gen_random_uuid(),
        role text not null,
        content text not null,
        created_at timestamptz default now()
      );
    `
  });

  // Since execute_sql might not exist, let's just insert via REST API if table exists. Wait, we can't create tables from REST API unless using a postgres connection string. Let's check if we can.
  console.log("Creation query attempted.");
}
run();
