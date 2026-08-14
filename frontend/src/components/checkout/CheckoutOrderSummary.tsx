import { CouponInput } from "@/components/cart/CouponInput";
import type { CartItem } from "@/types";

interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  coupon?: AppliedCoupon | null;
  onCouponChange: (coupon: AppliedCoupon | null) => void;
}

const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING_ESTIMATE = 50;

export function CheckoutOrderSummary({
  items,
  subtotal,
  coupon,
  onCouponChange,
}: CheckoutOrderSummaryProps) {
  const shippingEstimate = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_ESTIMATE;
  const discount = coupon?.discountAmount ?? 0;
  const total = subtotal + shippingEstimate - discount;

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

      <div className="mt-4 border-t border-border pt-4">
        <CouponInput orderValue={subtotal} onPreview={onCouponChange} />
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Shipping</span>
          <span className={shippingEstimate === 0 ? "font-medium text-success" : "text-foreground"}>
            {shippingEstimate === 0 ? "Free" : `₹${shippingEstimate}`}
          </span>
        </div>
        {coupon && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Coupon ({coupon.code})</span>
            <span className="text-success">−₹{coupon.discountAmount.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold text-foreground">
        <span>Total</span>
        <span>₹{total.toLocaleString("en-IN")}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Final total is confirmed by the server when your order is created.
      </p>
    </div>
  );
}