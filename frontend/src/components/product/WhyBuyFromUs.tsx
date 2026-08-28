import { ShieldCheck, Landmark, Headphones, Store, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface WhyBuyFromUsProps {
  size?: "sm" | "lg";
}

export function WhyBuyFromUs({ size = "sm" }: WhyBuyFromUsProps) {
  const isLarge = size === "lg";

  return (
    <div className={cn(!isLarge && "rounded-lg border border-border bg-card p-4")}>
      {!isLarge && (
        <p className="mb-3 text-sm font-semibold text-foreground">Why Buy From Us?</p>
      )}
      <div
        className={cn(
          "grid grid-cols-5 gap-2",
          isLarge &&
            "mx-auto flex max-w-3xl snap-x snap-mandatory gap-3 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:pb-0 sm:snap-none"
        )}
      >
        {TRUST_POINTS.map((point) => (
          <div
            key={point.label}
            className={cn(
              "group flex flex-col items-center gap-1.5 text-center transition",
              isLarge
                ? "w-24 shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-soft hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft-lg sm:w-auto sm:shrink sm:p-5"
                : "rounded-lg p-2 hover:bg-muted/60"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full transition group-hover:scale-110",
                isLarge ? "h-12 w-12 sm:h-14 sm:w-14" : "h-9 w-9",
                tintClasses[point.tint]
              )}
            >
              <point.icon className={isLarge ? "h-5 w-5 sm:h-6 sm:w-6" : "h-4 w-4"} />
            </span>
            <p
              className={cn(
                "font-medium leading-tight text-foreground",
                isLarge ? "text-xs sm:text-sm" : "text-[11px]"
              )}
            >
              {point.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}