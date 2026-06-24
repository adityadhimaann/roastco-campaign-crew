"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MessageSquare, Users, BarChart3, Coffee, PanelLeftClose, PanelLeft, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Campaigns", url: "/campaigns", icon: MessageSquare },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <Coffee className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">Roast &amp; Co.</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Spacer reserves layout width */}
      <div className={cn("hidden md:block shrink-0 transition-[width] duration-200", open ? "w-60" : "w-16")} />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 overflow-hidden",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
          "md:translate-x-0",
          open ? "md:w-60" : "md:w-16"
        )}
      >
        <div
          className={cn(
            "py-6 flex items-center gap-2.5 border-b border-sidebar-border h-[85px]",
            open ? "px-6" : "md:px-0 md:justify-center px-6"
          )}
        >
          <div className={cn("flex items-center gap-2.5 flex-1", !open && "md:hidden")}>
            <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Coffee className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-semibold tracking-tight truncate">Roast &amp; Co.</div>
              <div className="text-[11px] text-sidebar-foreground/60 -mt-0.5 truncate">
                Campaign CRM
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden h-9 w-9 shrink-0 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="hidden md:block">
            {open ? (
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 shrink-0 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="h-9 w-9 shrink-0 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 flex items-center justify-center"
                aria-label="Open sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <nav className="px-3 py-4 flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          {items.map((item) => {
            const active = pathname === item.url;
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  open ? "px-3" : "md:px-0 md:justify-center px-3",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
                title={!open ? item.title : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={cn("truncate", !open && "md:hidden")}>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className={cn("px-6 py-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50 whitespace-nowrap overflow-hidden", !open && "md:hidden")}>
          v1.0 · Marketing Suite
        </div>
      </aside>
    </>
  );
}
