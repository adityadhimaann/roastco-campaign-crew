"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Campaigns", url: "/campaigns", icon: MessageSquare },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center h-16 pb-safe">
      {items.map((item) => {
        const active = pathname === item.url;
        return (
          <Link
            key={item.url}
            href={item.url}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              active ? "text-primary" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
