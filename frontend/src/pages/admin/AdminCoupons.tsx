import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Plus, Pencil, Tag } from "lucide-react";
import { listCoupons, updateCoupon } from "@/api/coupon.api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CouponFormDialog } from "@/components/admin/CouponFormDialog";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types/coupon";
import type { ApiErrorResponse } from "@/types";

const unwrap = (res: any) => res.data?.data ?? res.data;
const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};

function formatDiscount(coupon: Coupon) {
  if (coupon.discountType === "percentage") {
    const cap = coupon.maxDiscountAmount ? ` (max ₹${coupon.maxDiscountAmount.toLocaleString("en-IN")})` : "";
    return `${coupon.discountValue}%${cap}`;
  }
  return `₹${coupon.discountValue.toLocaleString("en-IN")} off`;
}

function isExpired(coupon: Coupon) {
  return new Date(coupon.validUntil).getTime() < Date.now();
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCoupons = useCallback(() => {
    setIsLoading(true);
    listCoupons()
      .then((res) => {
        const data = unwrap(res);
        const list: Coupon[] = data?.coupons ?? (Array.isArray(data) ? data : []);
        setCoupons(list);
      })
      .catch(() => toast.error("Failed to load coupons"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreateDialog = () => {
    setEditingCoupon(null);
    setDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setTogglingId(coupon._id);
    try {
      await updateCoupon(coupon._id, { isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success(coupon.isActive ? "Coupon deactivated" : "Coupon activated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update coupon"));
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) return <Spinner fullScreen />;

  return (
    <div className="container py-8">
      <AdminPageHeader
        title="Coupons"
        description={`${coupons.length} coupon${coupons.length === 1 ? "" : "s"}`}
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="p-3 text-left font-semibold text-foreground">Code</th>
              <th className="p-3 text-left font-semibold text-foreground">Discount</th>
              <th className="p-3 text-left font-semibold text-foreground">Min Order</th>
              <th className="p-3 text-left font-semibold text-foreground">Usage</th>
              <th className="p-3 text-left font-semibold text-foreground">Valid Until</th>
              <th className="p-3 text-left font-semibold text-foreground">Status</th>
              <th className="p-3 text-right font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const expired = isExpired(coupon);
              return (
                <tr key={coupon._id} className="border-b border-border last:border-0 hover:bg-accent/40">
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-foreground">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      {coupon.code}
                    </span>
                  </td>
                  <td className="p-3 text-foreground">{formatDiscount(coupon)}</td>
                  <td className="p-3 text-muted-foreground">
                    ₹{coupon.minOrderValue.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""} used
                  </td>
                  <td className={cn("p-3", expired ? "text-destructive" : "text-muted-foreground")}>
                    {new Date(coupon.validUntil).toLocaleDateString("en-IN")}
                    {expired && " (expired)"}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon)}
                      disabled={togglingId === coupon._id}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize transition-colors",
                        coupon.isActive
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      )}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(coupon)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No coupons yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CouponFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCoupon={editingCoupon}
        onSaved={fetchCoupons}
      />
    </div>
  );
}