import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import useCartStore from "@/store/cartStore";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);
  const isMutating = useCartStore((state) => state.isMutating);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (isLoading) return <Spinner fullScreen />;

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </span>
        <h1 className="text-xl font-bold text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link to="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your Cart</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => clear()}>
          Clear cart
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartItemRow
                key={item.product}
                item={item}
                isMutating={isMutating}
                onUpdateQty={updateItem}
                onRemove={removeItem}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <OrderSummary subtotal={subtotal} onCheckout={() => navigate("/checkout")} />
      </div>
    </div>
  );
}