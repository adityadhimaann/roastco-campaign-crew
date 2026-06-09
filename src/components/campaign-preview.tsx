import { Users, MessageCircle, Send, Pencil } from "lucide-react";

export function CampaignPreview({ campaign, onSend, isSending }: { campaign: any, onSend: (id: string) => void, isSending: boolean }) {
  if (!campaign) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-10 min-h-[400px]">
        <h2 className="font-semibold text-slate-500 mb-2">No active draft</h2>
        <p className="text-sm text-slate-400 text-center max-w-sm">
          Use the chat on the left to tell the AI what kind of campaign you want to run. Your drafted campaign will appear here.
        </p>
      </div>
    );
  }

  const isDraft = campaign.status === 'draft';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-900 text-sm">Campaign Preview</h2>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wider">
          {campaign.status}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Segment */}
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <Users className="h-3.5 w-3.5" /> Target Audience
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {campaign.audience_count} <span className="text-sm font-normal text-slate-500">customers</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Array.isArray(campaign.segment_filters) 
                ? campaign.segment_filters 
                : (campaign.segment_filters ? [campaign.segment_filters] : [])
            ).map((filter: any, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                {typeof filter === 'object' ? JSON.stringify(filter) : String(filter)}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Message */}
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <MessageCircle className="h-3.5 w-3.5" /> Draft Message
          </div>
          <div className="mt-2 bg-[#DCF8C6] text-slate-800 text-sm leading-relaxed rounded-2xl rounded-tl-sm px-4 py-3">
            {campaign.preview_message}
          </div>
          <p className="mt-2 text-xs text-slate-400">Message personalized per customer</p>
        </div>

        <div className="border-t border-slate-100" />

        {/* Channel */}
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Channel</div>
          <div className="mt-2 flex gap-2">
            <button className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
              campaign.channel?.toLowerCase() === 'whatsapp' 
                ? 'bg-[#25D366]/10 text-[#128C7E] border-[#25D366]/30' 
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              WhatsApp
            </button>
            <button className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
              campaign.channel?.toLowerCase() === 'sms' 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              SMS
            </button>
            <button className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
              campaign.channel?.toLowerCase() === 'email' 
                ? 'bg-orange-50 text-orange-600 border-orange-200' 
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              Email
            </button>
          </div>
        </div>

        {/* Actions */}
        {isDraft && (
          <div className="flex gap-2 pt-1">
            <button 
              onClick={() => onSend(campaign.id)}
              disabled={isSending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> {isSending ? 'Sending...' : 'Send Campaign'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
