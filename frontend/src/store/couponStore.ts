import { create } from "zustand";

interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CouponState {
  coupon: AppliedCoupon | null;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  clearCoupon: () => void;
}

const useCouponStore = create<CouponState>((set) => ({
  coupon: null,
  setCoupon: (coupon) => set({ coupon }),
  clearCoupon: () => set({ coupon: null }),
}));

export default useCouponStore;