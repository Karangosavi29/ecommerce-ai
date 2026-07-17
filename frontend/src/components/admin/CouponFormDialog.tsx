import { useState, useEffect, type FormEvent } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createCoupon, updateCoupon } from "@/api/coupon.api";
import type { Coupon } from "@/types/coupon";
import type { ApiErrorResponse } from "@/types";

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCoupon: Coupon | null;
  onSaved: () => void;
}

interface FormState {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: string;
  minOrderValue: string;
  maxDiscountAmount: string;
  maxUses: string;
  maxUsesPerUser: string;
  validFrom: string;
  validUntil: string;
}

const emptyForm: FormState = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "0",
  maxDiscountAmount: "",
  maxUses: "",
  maxUsesPerUser: "1",
  validFrom: "",
  validUntil: "",
};

const toDateInputValue = (iso: string) => iso?.slice(0, 10) ?? "";

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};

export function CouponFormDialog({ open, onOpenChange, editingCoupon, onSaved }: CouponFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCoupon) {
      setForm({
        code: editingCoupon.code,
        discountType: editingCoupon.discountType,
        discountValue: String(editingCoupon.discountValue),
        minOrderValue: String(editingCoupon.minOrderValue),
        maxDiscountAmount: editingCoupon.maxDiscountAmount != null ? String(editingCoupon.maxDiscountAmount) : "",
        maxUses: editingCoupon.maxUses != null ? String(editingCoupon.maxUses) : "",
        maxUsesPerUser: String(editingCoupon.maxUsesPerUser),
        validFrom: toDateInputValue(editingCoupon.validFrom),
        validUntil: toDateInputValue(editingCoupon.validUntil),
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingCoupon, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!form.discountValue || Number(form.discountValue) < 0) {
      toast.error("Enter a valid discount value");
      return;
    }
    if (!form.validUntil) {
      toast.error("Valid until date is required");
      return;
    }

    // Strip empty optional fields rather than sending "" (which would fail
    // the backend's z.coerce.number()/z.coerce.date() on an empty string).
    const payload: Record<string, unknown> = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue || 0),
      maxUsesPerUser: Number(form.maxUsesPerUser || 1),
      validUntil: form.validUntil,
    };
    if (form.maxDiscountAmount) payload.maxDiscountAmount = Number(form.maxDiscountAmount);
    if (form.maxUses) payload.maxUses = Number(form.maxUses);
    if (form.validFrom) payload.validFrom = form.validFrom;

    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload as any);
        toast.success("Coupon updated");
      } else {
        await createCoupon(payload as any);
        toast.success("Coupon created");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, editingCoupon ? "Failed to update coupon" : "Failed to create coupon"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-code">Coupon Code</Label>
            <Input
              id="c-code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              disabled={!!editingCoupon}
              placeholder="e.g. WELCOME10"
              required
            />
            {editingCoupon && (
              <p className="text-xs text-muted-foreground">Code can't be changed after creation.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-type">Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(v: "percentage" | "flat") => setForm({ ...form, discountType: v })}
              >
                <SelectTrigger id="c-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-value">
                Discount Value {form.discountType === "percentage" ? "(%)" : "(₹)"}
              </Label>
              <Input
                id="c-value"
                type="number"
                min={0}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                required
              />
            </div>
          </div>

          {form.discountType === "percentage" && (
            <div className="space-y-2">
              <Label htmlFor="c-maxdiscount">Max Discount Amount (₹, optional)</Label>
              <Input
                id="c-maxdiscount"
                type="number"
                min={0}
                value={form.maxDiscountAmount}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                placeholder="Caps the % discount, e.g. 200"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="c-minorder">Minimum Order Value (₹)</Label>
            <Input
              id="c-minorder"
              type="number"
              min={0}
              value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-maxuses">Total Uses (optional)</Label>
              <Input
                id="c-maxuses"
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Blank = unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-maxperuser">Uses Per Customer</Label>
              <Input
                id="c-maxperuser"
                type="number"
                min={1}
                value={form.maxUsesPerUser}
                onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-validfrom">Valid From (optional)</Label>
              <Input
                id="c-validfrom"
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Defaults to today if left blank.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-validuntil">Valid Until</Label>
              <Input
                id="c-validuntil"
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}