"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, Msg } from "@/components/chat-message";
import { CampaignPreview } from "@/components/campaign-preview";

export default function CampaignsPage() {



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
              <ChatMessage key={i} message={m} />
            ))}
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg pr-2 border border-slate-200 min-h-[48px] focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500 transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your campaign goal…"
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400 h-full"
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
          <CampaignPreview />

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
