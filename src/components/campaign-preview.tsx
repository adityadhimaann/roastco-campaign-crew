import { Users, MessageCircle, Send, Pencil } from "lucide-react";

export function CampaignPreview() {
  return (
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
  );
}
