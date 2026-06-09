import { Link, useRouterState } from "@tanstack/react-router";
import { MessageSquare, Users, BarChart3, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Campaigns", url: "/", icon: MessageSquare },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      <div className="px-6 py-6 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <Coffee className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">Roast &amp; Co.</div>
          <div className="text-[11px] text-sidebar-foreground/60 -mt-0.5">Campaign CRM</div>
        </div>
      </div>
      <nav className="px-3 py-4 flex-1 space-y-1">
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
        v1.0 · Marketing Suite
      </div>
    </aside>
  );
}
