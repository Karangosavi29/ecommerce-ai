import { ShieldCheck, Landmark, Headphones, Store, BadgeCheck } from "lucide-react";

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "Genuine", tint: "success" },
  { icon: ShieldCheck, label: "Secure Pay", tint: "primary" },
  { icon: Landmark, label: "EMI", tint: "warning" },
  { icon: Headphones, label: "Support", tint: "success" },
  { icon: Store, label: "Visit Store", tint: "primary" },
];

const tintClasses: Record<string, string> = {
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
};

export function WhyBuyFromUs() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Why Buy From Us?</p>
      <div className="grid grid-cols-5 gap-2">
        {TRUST_POINTS.map((point) => (
          <div
            key={point.label}
            className="group flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition hover:bg-muted/60"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full transition group-hover:scale-110 ${tintClasses[point.tint]}`}
            >
              <point.icon className="h-4 w-4" />
            </span>
            <p className="text-[11px] font-medium leading-tight text-foreground">{point.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}