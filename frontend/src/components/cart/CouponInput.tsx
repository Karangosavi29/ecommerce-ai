import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Tag, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { previewCoupon } from "@/api/coupon.api";
import type { ApiErrorResponse } from "@/types";

interface CouponInputProps {
  orderValue: number;
  onPreview: (result: { code: string; discountAmount: number } | null) => void;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};

export function CouponInput({ orderValue, onPreview }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [applied, setApplied] = useState<{ code: string; discountAmount: number } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsChecking(true);
    try {
      const res = await previewCoupon(code.trim().toUpperCase(), orderValue);
      const data = res.data?.data ?? res.data;
      const result = { code: data.code, discountAmount: data.discountAmount };
      setApplied(result);
      onPreview(result);
      toast.success(`Coupon valid — saves ₹${result.discountAmount.toLocaleString("en-IN")}`);
    } catch (err) {
      setApplied(null);
      onPreview(null);
      toast.error(getErrorMessage(err, "Invalid or expired coupon"));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            aria-label="Coupon code"
            className="pl-9 uppercase"
          />
        </div>
        <Button type="submit" variant="outline" disabled={isChecking}>
          {isChecking ? "Checking..." : "Apply"}
        </Button>
      </form>

      {applied && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-success/10 p-2.5 text-xs text-success">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>{applied.code}</strong> would save you ₹{applied.discountAmount.toLocaleString("en-IN")}.
            This is an estimate — it isn't automatically deducted from your order total yet.
          </span>
        </div>
      )}
    </div>
  );
}