import { cn } from "@/lib/utils";

export type Msg = {
  from: "ai" | "user";
  text: string;
  time: string;
  loading?: boolean;
};

export function ChatMessage({ message }: { message: Msg }) {
  return (
    <div className={cn("flex", message.from === "user" ? "justify-end" : "justify-start")}>
      <div className="flex flex-col max-w-[75%]">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm",
            message.from === "ai"
              ? "bg-white text-slate-800 rounded-bl-sm border border-slate-200/80"
              : "bg-[#DCF8C6] text-slate-800 rounded-br-sm",
          )}
        >
          {message.text}
          {message.loading && (
            <span className="inline-flex gap-1 ml-2 align-middle">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:300ms]" />
            </span>
          )}
          <span
            className={cn(
              "block text-[10px] mt-1 text-right",
              message.from === "ai" ? "text-slate-400" : "text-emerald-700/70",
            )}
          >
            {message.time}
          </span>
        </div>
      </div>
    </div>
  );
}
