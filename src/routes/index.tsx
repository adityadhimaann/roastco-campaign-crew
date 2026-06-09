import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  Users,
  MessageCircle,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campaigns · Roast & Co. CRM" },
      { name: "description", content: "Create and launch marketing campaigns with your AI agent." },
    ],
  }),
  component: CampaignsPage,
});

type Msg = { from: "ai" | "user"; text: string; time: string; loading?: boolean };

const initialMessages: Msg[] = [
  {
    from: "user",
    text: "Re-engage customers who haven't ordered in 60 days. Offer 15% off.",
    time: "10:02 AM",
  },
  { from: "ai", text: "Got it. Searching your customer database…", time: "10:02 AM", loading: true },
  {
    from: "ai",
    text: "Found 127 customers matching your criteria. Here's what I'm planning:",
    time: "10:03 AM",
  },
];

function CampaignsPage() {
  const [messages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Campaigns</h1>
        <p className="text-sm text-slate-500 mt-1">
          Describe your campaign in plain English. Your AI agent does the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT — Chat */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-160px)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Campaign Agent</div>
                <div className="text-xs text-slate-500">Powered by AI</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2.5 max-w-[85%]",
                  m.from === "user" ? "ml-auto flex-row-reverse" : "",
                )}
              >
                {m.from === "ai" && (
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.from === "ai"
                      ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm",
                  )}
                >
                  {m.text}
                  {m.loading && (
                    <span className="inline-flex gap-1 ml-2 align-middle">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg pr-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your campaign goal…"
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3.5 py-2 text-sm font-medium transition-colors"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm">Campaign Preview</h2>
            </div>

            <div className="p-5 space-y-5">
              {/* Segment */}
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <Users className="h-3.5 w-3.5" /> Target Audience
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  127 <span className="text-sm font-normal text-slate-500">customers</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                    Last order &gt; 60 days ago
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                    Has email on file
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Message */}
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <MessageCircle className="h-3.5 w-3.5" /> Draft Message
                </div>
                <div className="mt-2 bg-[#DCF8C6] text-slate-800 text-sm leading-relaxed rounded-2xl rounded-tl-sm px-4 py-3">
                  Hey Sarah! ☕ We miss you at Roast &amp; Co. It's been a while since your last
                  visit. Come back with 15% off your next order — use code{" "}
                  <strong>COMEBACK15</strong>. Valid for 7 days!
                </div>
                <p className="mt-2 text-xs text-slate-400">Message personalized per customer</p>
              </div>

              <div className="border-t border-slate-100" />

              {/* Channel */}
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Channel
                </div>
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30">
                    WhatsApp
                  </button>
                  <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
                    SMS
                  </button>
                  <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
                    Email
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium">
                  <Send className="h-3.5 w-3.5" /> Send Campaign
                </button>
                <button className="inline-flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md px-4 py-2.5 text-sm font-medium">
                  <Pencil className="h-3.5 w-3.5" /> Edit Message
                </button>
              </div>
            </div>
          </div>

          {/* Recent */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Recent Campaigns</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {[
                { name: "Win-back Q2", sent: 89, ago: "3 days ago" },
                { name: "New Menu Launch", sent: 234, ago: "1 week ago" },
                { name: "Loyalty Push", sent: 56, ago: "2 weeks ago" },
              ].map((c) => (
                <li key={c.name} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500">
                      Sent {c.sent} · {c.ago}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
