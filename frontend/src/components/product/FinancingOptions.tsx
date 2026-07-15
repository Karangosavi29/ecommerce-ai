import { Landmark, FileCheck } from "lucide-react";

const PARTNERS = [
  { name: "Bajaj Finance", note: "Flexible EMI plans" },
  { name: "Kotak Finance", note: "Easy approval process" },
];

const APPLY_STEPS = [
  "Visit our store",
  "Select your product",
  "Complete finance verification",
  "Take your product home",
];

const REQUIRED_DOCS = ["ID Proof", "Address Proof", "Required documents"];

export function FinancingOptions() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Landmark className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Buy Now, Pay Monthly</p>
          <p className="text-xs text-muted-foreground">Easy EMI options available</p>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Finance Partners
      </p>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {PARTNERS.map((partner) => (
          <div
            key={partner.name}
            className="rounded-md border border-border bg-background px-3 py-2.5"
          >
            <p className="text-sm font-medium text-foreground">{partner.name}</p>
            <p className="text-xs text-muted-foreground">{partner.note}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        How to Apply
      </p>
      <ol className="mb-4 space-y-1.5">
        {APPLY_STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-sm text-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
        <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-semibold text-foreground">Bring with you:</p>
          <p className="text-xs text-muted-foreground">{REQUIRED_DOCS.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}