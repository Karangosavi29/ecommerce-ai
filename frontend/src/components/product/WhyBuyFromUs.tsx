import { ShieldCheck, Landmark, Headphones, Store, BadgeCheck } from "lucide-react";

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "Genuine Products" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Landmark, label: "EMI Assistance Available" },
  { icon: Headphones, label: "Customer Support" },
  { icon: Store, label: "Store Visit Available" },
];

export function WhyBuyFromUs() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Why Buy From Us?</p>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-1">
        {TRUST_POINTS.map((point) => (
          <li key={point.label} className="flex items-center gap-2 text-sm text-foreground">
            <point.icon className="h-4 w-4 shrink-0 text-success" />
            {point.label}
          </li>
        ))}
      </ul>
    </div>
  );
}