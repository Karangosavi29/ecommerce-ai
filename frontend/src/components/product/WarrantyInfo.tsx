import { useState } from "react";
import { ShieldCheck, PhoneCall, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

const WARRANTY_POINTS = [
  "Manufacturer warranty applies from the date of purchase",
  "Covers manufacturing defects under normal use",
  "Physical damage and liquid damage are typically not covered",
  "Keep your invoice — it's required for any warranty claim",
];

export function WarrantyInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Warranty & Support</p>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                Protected
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Warranty coverage varies by manufacturer and product for this item.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-primary/20 bg-card/60 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
        >
          {expanded ? "Hide details" : "What's covered?"}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 space-y-2 border-t border-border p-4 duration-150">
          {WARRANTY_POINTS.map((point) => (
            <div key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{point}</span>
            </div>
          ))}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5">
              <PhoneCall className="h-3.5 w-3.5" />
              Call Support
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition hover:border-success/40 hover:bg-success/5">
              <MessageCircle className="h-3.5 w-3.5" />
              Chat with Us
            </button>
          </div>
        </div>
      )}
    </div>
  );
}