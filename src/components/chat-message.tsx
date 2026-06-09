import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export type Msg = {
  from: "ai" | "user";
  text: string;
  time: string;
  loading?: boolean;
};

export function ChatMessage({ message }: { message: Msg }) {
  const isAi = message.from === "ai";
  
  return (
    <div className={cn("flex w-full gap-2", isAi ? "justify-start" : "justify-end")}>
      {isAi && (
        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-auto mb-1">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      )}
      
      <div className="flex flex-col max-w-[75%]">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm",
            isAi
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
              isAi ? "text-slate-400" : "text-emerald-700/70",
            )}
          >
            {message.time}
          </span>
        </div>
      </div>

      {!isAi && (
        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-auto mb-1">
          <User className="h-4 w-4 text-emerald-600" />
        </div>
      )}
    </div>
  );
}
