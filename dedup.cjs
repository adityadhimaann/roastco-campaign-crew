const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: customers, error } = await supabase.from('customers').select('*');
  if (error) throw error;

  console.log(`Found ${customers.length} total customers.`);

  const emailMap = new Map();
  const toDelete = [];

  for (const c of customers) {
    if (emailMap.has(c.email)) {
      toDelete.push(c.id);
    } else {
      emailMap.set(c.email, c.id);
    }
  }

  console.log(`Found ${toDelete.length} duplicate emails to delete.`);

  if (toDelete.length > 0) {
    // Delete in batches of 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      
      // Delete child records first to satisfy foreign key constraints
      await supabase.from('orders').delete().in('customer_id', batch);
      await supabase.from('messages').delete().in('customer_id', batch);

      const { error: delErr } = await supabase.from('customers').delete().in('id', batch);
      if (delErr) {
        console.error('Error deleting:', delErr);
      } else {
        console.log(`Deleted batch of ${batch.length}`);
      }
    }
  }

  console.log('Deduplication complete.');
}

run().catch(console.error);
