"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, Msg } from "@/components/chat-message";
import { CampaignPreview } from "@/components/campaign-preview";

export default function CampaignsPage() {



  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Fetch recent campaigns for the sidebar
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        if (data.campaigns) {
          setRecentCampaigns(data.campaigns);
        }
      } catch (err) {
        console.error("Error fetching recent campaigns:", err);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
    // Poll every few seconds so it updates when a new one is created via chat
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Msg = {
      from: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Convert to API format {role: 'user'|'assistant', content: string}
      const apiMessages = newMessages.map(m => ({
        role: m.from === "ai" ? "assistant" : "user",
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: data.message || "An error occurred.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "Sorry, I couldn't connect to the server.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe your campaign goal…"
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400 h-full"
              />
              <button
                onClick={handleSend}
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
              {loadingCampaigns ? (
                <li className="px-5 py-8 text-center text-slate-400 text-sm">Loading...</li>
              ) : recentCampaigns.length === 0 ? (
                <li className="px-5 py-8 text-center text-slate-400 text-sm">No campaigns sent yet.</li>
              ) : (
                recentCampaigns.map((c: any) => (
                  <li key={c.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">
                        Audience: {c.audience_count} · {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Running
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
