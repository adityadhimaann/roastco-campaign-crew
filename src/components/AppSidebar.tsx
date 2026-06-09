import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Users, BarChart3, Coffee, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Campaigns", url: "/", icon: MessageSquare },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Spacer reserves layout width */}
      <div
        className={cn(
          "shrink-0 transition-[width] duration-200",
          open ? "w-60" : "w-0",
        )}
      />

      {/* Floating toggle when closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-30 h-9 w-9 rounded-md bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 flex items-center justify-center"
          aria-label="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-60 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold tracking-tight">Roast &amp; Co.</div>
            <div className="text-[11px] text-sidebar-foreground/60 -mt-0.5">Campaign CRM</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-7 w-7 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        <nav className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
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
    </>
  );
}
