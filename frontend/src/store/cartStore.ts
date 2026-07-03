import { create } from "zustand";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/api/cart.api";
import type { CartItem, ApiErrorResponse } from "@/types";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isMutating: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<boolean>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  isMutating: false,
  itemCount: 0,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await getCart();
      const items: CartItem[] = res.data.items ?? res.data.cart?.items ?? [];
      set({
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      });
    } catch (err) {
      // Not logged in or empty cart — fail quietly, don't toast on background fetch
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity) => {
    set({ isMutating: true });
    try {
      const res = await addToCart(productId, quantity);
      const items: CartItem[] = res.data.items ?? res.data.cart?.items ?? get().items;
      set({
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      });
      toast.success("Added to cart");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add to cart"));
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const res = await updateCartItem(productId, quantity);
      const items: CartItem[] = res.data.items ?? res.data.cart?.items ?? get().items;
      set({
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update cart"));
    }
  },

  removeItem: async (productId) => {
    try {
      const res = await removeCartItem(productId);
      const items: CartItem[] = res.data.items ?? res.data.cart?.items ?? get().items;
      set({
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      });
      toast.success("Item removed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove item"));
    }
  },

  clear: async () => {
    try {
      await clearCart();
      set({ items: [], itemCount: 0 });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to clear cart"));
    }
  },
}));

export default useCartStore;