import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CouponInput } from "@/components/cart/CouponInput";

interface OrderSummaryProps {
  subtotal: number;
  onCheckout: () => void;
}


const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING_ESTIMATE = 50;

export function OrderSummary({ subtotal, onCheckout }: OrderSummaryProps) {
  const shippingEstimate = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_ESTIMATE;
  const estimatedTotal = subtotal + shippingEstimate;


  const [couponPreview, setCouponPreview] = useState<{ code: string; discountAmount: number } | null>(
    null
  );

  return (
    <div className="h-fit rounded-lg border border-border bg-card p-6 shadow-soft">
      <h2 className="mb-4 text-lg font-bold text-foreground">Order Summary</h2>

      <div className="mb-4">
        <CouponInput orderValue={subtotal} onPreview={setCouponPreview} />
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Estimated shipping</span>
          <span className={shippingEstimate === 0 ? "font-medium text-success" : "text-foreground"}>
            {shippingEstimate === 0 ? "Free" : `₹${shippingEstimate}`}
          </span>
        </div>
        {shippingEstimate > 0 && (
          <p className="text-xs text-muted-foreground">
            Free shipping on orders over ₹{FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}
          </p>
        )}
        {couponPreview && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Coupon ({couponPreview.code})</span>
            <span className="text-success">
              −₹{couponPreview.discountAmount.toLocaleString("en-IN")} (estimate)
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold text-foreground">
        <span>Estimated total</span>
        <span>₹{estimatedTotal.toLocaleString("en-IN")}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Taxes and final shipping calculated at checkout.
        {couponPreview && " Coupon discount is not yet applied automatically."}
      </p>

      <Button className="mt-5 w-full" size="lg" onClick={onCheckout}>
        Proceed to Checkout
      </Button>
    </div>
  );
}