import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import useCartStore from "@/store/cartStore";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";

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

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (isLoading) return <Spinner fullScreen />;

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-10 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Button variant="ghost" size="sm" onClick={() => clear()}>
          Clear cart
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item, idx) => {
            const image = item.product?.images?.[0];
            const atMax = item.quantity >= (item.product?.stock ?? 0);
            const itemKey = item.product?._id ?? `cart-item-${idx}`;

            return (
              <div key={itemKey} className="flex gap-4 rounded-lg border p-4">
                <Link
                  to={`/products/${item.product._id}`}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/products/${item.product._id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={item.quantity <= 1 || isMutating}
                        onClick={() =>
                          updateItem(item.product._id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={atMax || isMutating}
                        onClick={() =>
                          updateItem(item.product._id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-semibold">
                      ₹
                      {(item.product.price * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Shipping and taxes calculated at checkout.
          </p>
          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}