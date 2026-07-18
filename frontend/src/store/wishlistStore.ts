import { create } from "zustand";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/api/wishlist.api";
import type { Product, ApiErrorResponse } from "@/types";


export interface WishlistProduct extends Product {
  unavailable?: boolean;
}

interface WishlistState {
  ids: string[];
  products: WishlistProduct[];
  isLoading: boolean;
  isMutating: boolean;
  hasFetched: boolean;
  fetchWishlist: () => Promise<void>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};


const unwrap = (res: any) => res.data?.data ?? res.data;

const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  products: [],
  isLoading: false,
  isMutating: false,
  hasFetched: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await getWishlist();
      const data = unwrap(res);
      const products: WishlistProduct[] = data?.products ?? [];
      set({
        products,
        ids: products.map((p) => p._id),
        hasFetched: true,
      });
    } catch (err) {
      // Not logged in, or empty wishlist — fail quietly on background fetch.
    } finally {
      set({ isLoading: false });
    }
  },

  has: (productId) => get().ids.includes(productId),

  toggle: async (productId) => {
    const alreadyIn = get().has(productId);
    set({ isMutating: true });

    // Optimistic id update so the heart icon flips instantly.
    set((state) => ({
      ids: alreadyIn
        ? state.ids.filter((id) => id !== productId)
        : [...state.ids, productId],
    }));

    try {
      const res = alreadyIn
        ? await removeFromWishlist(productId)
        : await addToWishlist(productId);
      const data = unwrap(res);
      const products: WishlistProduct[] = data?.products ?? [];
      set({
        products,
        ids: products.map((p) => p._id),
      });
      toast.success(alreadyIn ? "Removed from wishlist" : "Added to wishlist");
    } catch (err) {
      // Roll back the optimistic change on failure.
      set((state) => ({
        ids: alreadyIn
          ? [...state.ids, productId]
          : state.ids.filter((id) => id !== productId),
      }));
      toast.error(getErrorMessage(err, "Failed to update wishlist"));
    } finally {
      set({ isMutating: false });
    }
  },

  clear: async () => {
    try {
      await clearWishlist();
      set({ ids: [], products: [] });
      toast.success("Wishlist cleared");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to clear wishlist"));
    }
  },
}));

export default useWishlistStore;