import { ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderMethodProps {
  isPaying: boolean;
  onRazorpay: (e: React.FormEvent) => void;
}

const ACCEPTED_METHODS = ["UPI", "Credit/Debit Card", "Net Banking", "Wallets"];

export function OrderMethod({ isPaying, onRazorpay }: OrderMethodProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold text-foreground">Payment Method</h2>
      </div>

      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-foreground">Online Payment</p>
        <p className="mt-1 text-xs text-muted-foreground">Pay securely using:</p>

        <ul className="mt-2 space-y-1">
          {ACCEPTED_METHODS.map((method) => (
            <li key={method} className="flex items-center gap-1.5 text-xs text-foreground">
              <Check className="h-3.5 w-3.5 text-success" />
              {method}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs text-muted-foreground">Powered by Razorpay</p>

        <Button onClick={onRazorpay} disabled={isPaying} size="lg" className="mt-4 w-full">
          {isPaying ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}