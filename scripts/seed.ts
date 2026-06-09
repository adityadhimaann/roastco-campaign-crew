// No need for dotenv, we'll run with --env-file

import { supabase } from '../src/lib/supabase';

const customers = [
  { name: 'Priya Sharma',  email: 'priya.s@gmail.com',  city: 'Mumbai',     tags: ['high-value'] },
  { name: 'Rohan Mehta',   email: 'rohan.m@gmail.com',  city: 'Delhi',      tags: ['lapsed'] },
  { name: 'Ananya Iyer',   email: 'ananya.i@gmail.com', city: 'Bangalore',  tags: ['high-value'] },
  { name: 'Karan Patel',   email: 'karan.p@gmail.com',  city: 'Ahmedabad',  tags: ['at-risk'] },
  { name: 'Sneha Nair',    email: 'sneha.n@gmail.com',  city: 'Kochi',      tags: ['active'] },
  { name: 'Arjun Singh',   email: 'arjun.s@gmail.com',  city: 'Chandigarh', tags: ['lapsed'] },
  { name: 'Divya Reddy',   email: 'divya.r@gmail.com',  city: 'Hyderabad',  tags: ['high-value'] },
  { name: 'Amit Joshi',    email: 'amit.j@gmail.com',   city: 'Pune',       tags: ['at-risk'] },
];

// Generate more dummy customers
for (let i = 0; i < 192; i++) {
  customers.push({
    name: `Customer ${i + 9}`,
    email: `customer${i + 9}@example.com`,
    city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'][Math.floor(Math.random() * 6)],
    tags: [['high-value'], ['lapsed'], ['at-risk'], ['active']][Math.floor(Math.random() * 4)],
  });
}

async function seed() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase keys in .env.local!");
    process.exit(1);
  }

  console.log("Seeding customers...");
  const { data: insertedCustomers, error: customerError } = await supabase
    .from('customers')
    .insert(customers)
    .select();

  if (customerError || !insertedCustomers) {
    console.error("Error inserting customers:", customerError);
    process.exit(1);
  }

  console.log(`Inserted ${insertedCustomers.length} customers.`);
  console.log("Seeding orders...");

  // Generate 3-5 orders per customer
  const orders = insertedCustomers.flatMap((customer: any) => {
    const count = Math.floor(Math.random() * 5) + 1;
    return Array.from({ length: count }, () => ({
      customer_id: customer.id,
      amount: Math.floor(Math.random() * 2000) + 200,
      items: [{ name: 'Cappuccino', qty: 2 }, { name: 'Croissant', qty: 1 }],
      ordered_at: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString()
    }));
  });

  const { error: orderError } = await supabase.from('orders').insert(orders);
  if (orderError) {
    console.error("Error inserting orders:", orderError);
    process.exit(1);
  }

  console.log(`Inserted ${orders.length} orders.`);
  console.log('Seeded successfully!');
}

seed().catch(console.error);
