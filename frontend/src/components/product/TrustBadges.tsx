import { ShieldCheck, RotateCcw, PackageCheck } from "lucide-react";

const returnPolicyText = "Reach out within 7 days of delivery if there's an issue with your order.";

export function TrustBadges() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-primary" />
        <span className="text-xs font-medium text-foreground">Secure payments via Razorpay</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <PackageCheck className="h-4.5 w-4.5 shrink-0 text-primary" />
        <span className="text-xs font-medium text-foreground">Track your order anytime</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <RotateCcw className="h-4.5 w-4.5 shrink-0 text-primary" />
        <span className="text-xs font-medium text-foreground">{returnPolicyText}</span>
      </div>
    </div>
  );
}