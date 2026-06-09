import { supabase } from "@/lib/supabase";
import { CustomersClient } from "./customers-client";

export const revalidate = 0; // Disable caching so it's always fresh

export default async function CustomersPage() {
  const { data: customersData, error } = await supabase
    .from("customers")
    .select("*, orders(amount, ordered_at)")
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
  }

  const customers = (customersData || []).map((c: any) => {
    const totalOrders = c.orders?.length || 0;
    const spent = c.orders?.reduce((acc: number, o: any) => acc + Number(o.amount), 0) || 0;
    
    const lastOrderDates = c.orders?.map((o: any) => new Date(o.ordered_at).getTime()) || [];
    const maxDate = lastOrderDates.length ? Math.max(...lastOrderDates) : null;
    const daysAgo = maxDate ? Math.floor((Date.now() - maxDate) / (1000 * 60 * 60 * 24)) : null;
    
    let last = 'Never';
    let status = "New";
    if (daysAgo !== null) {
      last = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`;
      if (daysAgo > 60) status = "Lapsed";
      else if (daysAgo > 30) status = "At Risk";
      else status = "Active";
    }

    return {
      id: c.id,
      name: c.name,
      email: c.email || "No email",
      city: c.city || "Unknown",
      orders_count: totalOrders,
      spent,
      last,
      status
    };
  });

  return <CustomersClient initialCustomers={customers} />;
}
