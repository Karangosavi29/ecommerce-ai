import { ShieldCheck } from "lucide-react";


export function WarrantyInfo() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">Warranty & Support</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Warranty coverage varies by manufacturer and product. Contact our team or check the
        manufacturer's documentation for exact coverage terms on this item.
      </p>
    </div>
  );
}