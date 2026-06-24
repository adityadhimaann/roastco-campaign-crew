import { Coffee } from "lucide-react";

export function MobileHeader() {
  return (
    <div className="md:hidden flex items-center p-4 border-b border-slate-200 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <Coffee className="h-4 w-4" />
        </div>
        <span className="font-semibold text-slate-900 tracking-tight">Roast & Co.</span>
      </div>
    </div>
  );
}
