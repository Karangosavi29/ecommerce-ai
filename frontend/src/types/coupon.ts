export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFormData {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser: number;
  validFrom?: string;
  validUntil: string;
}