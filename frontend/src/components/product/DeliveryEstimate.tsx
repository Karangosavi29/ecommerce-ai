import { Truck } from "lucide-react";

const MIN_DAYS = 3;
const MAX_DAYS = 5;

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function DeliveryEstimate() {
  const today = new Date();
  const earliest = new Date(today);
  earliest.setDate(today.getDate() + MIN_DAYS);
  const latest = new Date(today);
  latest.setDate(today.getDate() + MAX_DAYS);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <Truck className="h-4.5 w-4.5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">
          Estimated delivery: {formatDate(earliest)} – {formatDate(latest)}
        </p>
        <p className="text-xs text-muted-foreground">Delivery window is approximate.</p>
      </div>
    </div>
  );
}