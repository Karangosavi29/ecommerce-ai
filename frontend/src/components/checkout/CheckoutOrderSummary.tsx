import type { CartItem } from "@/types";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
}

export function CheckoutOrderSummary({ items, subtotal }: CheckoutOrderSummaryProps) {
  return (
    <div className="h-fit rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">Order Summary</h2>

      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.product} className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="h-full w-full object-contain p-1" />
              ) : null}
            </div>
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="line-clamp-1 text-sm text-muted-foreground">
                {item.name} × {item.qty}
              </span>
              <span className="shrink-0 text-sm font-medium text-foreground">
                ₹{(item.price * item.qty).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold text-foreground">
        <span>Total</span>
        <span>₹{subtotal.toLocaleString("en-IN")}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Free shipping on orders ₹500+, otherwise ₹50 shipping applies.
      </p>
    </div>
  );
}