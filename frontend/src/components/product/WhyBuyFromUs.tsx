import { ShieldCheck, Landmark, Headphones, Store, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_ADDRESS } from "@/config/contact";

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "Genuine", tint: "success", opensStoreInfo: false },
  { icon: ShieldCheck, label: "Secure Pay", tint: "primary", opensStoreInfo: false },
  { icon: Landmark, label: "EMI", tint: "warning", opensStoreInfo: false },
  { icon: Headphones, label: "Support", tint: "success", opensStoreInfo: false },
  { icon: Store, label: "Visit Store", tint: "primary", opensStoreInfo: true },
];

const tintClasses: Record<string, string> = {
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
};
const openStoreInfo = () => window.dispatchEvent(new CustomEvent("open-store-info"));

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
        {TRUST_POINTS.map((point) => {
          const clickable = isLarge && point.opensStoreInfo && !!STORE_ADDRESS;

          const cardClass = cn(
            "group flex flex-col items-center gap-1.5 text-center transition",
            isLarge
              ? "w-24 shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-soft hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft-lg sm:w-auto sm:shrink sm:p-5"
              : "rounded-lg p-2 hover:bg-muted/60",
            clickable && "cursor-pointer"
          );

          const content = (
            <>
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
              {clickable && (
                <span className="text-[11px] font-medium text-primary">View address</span>
              )}
            </>
          );

          return clickable ? (
            <button
              key={point.label}
              type="button"
              onClick={openStoreInfo}
              aria-label="Visit our store: view address, hours and directions"
              className={cardClass}
            >
              {content}
            </button>
          ) : (
            <div key={point.label} className={cardClass}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}