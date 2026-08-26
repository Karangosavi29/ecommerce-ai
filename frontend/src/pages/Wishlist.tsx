import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import useWishlistStore from "@/store/wishlistStore";
import useCartStore from "@/store/cartStore";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const products = useWishlistStore((s) => s.products);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const hasFetched = useWishlistStore((s) => s.hasFetched);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const toggle = useWishlistStore((s) => s.toggle);
  const clear = useWishlistStore((s) => s.clear);

  const addItem = useCartStore((s) => s.addItem);
  const isMutating = useCartStore((s) => s.isMutating);

  useEffect(() => {
    if (!hasFetched) {
      fetchWishlist();
    }
  }, [hasFetched, fetchWishlist]);

  const handleMoveToCart = async (productId: string) => {
    const ok = await addItem(productId, 1);
    if (ok) toggle(productId);
  };

  if (isLoading && !hasFetched) return <Spinner fullScreen />;

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} item{products.length === 1 ? "" : "s"} saved
          </p>
        </div>
        {products.length > 0 && (
          <button
            onClick={clear}
            className="text-sm font-medium text-muted-foreground transition hover:text-destructive"
          >
            Clear all
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Save products you love and find them here later.
            </p>
          </div>
          <Button asChild>
            <Link to="/">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => {
            const hasDiscount = !!product.mrp && Number(product.mrp) > product.price;
            const discountPercent = hasDiscount
              ? Math.round(((Number(product.mrp) - product.price) / Number(product.mrp)) * 100)
              : 0;
            const outOfStock = product.stock <= 0;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition hover:shadow-soft-lg"
              >
                <button
                  onClick={() => toggle(product._id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-destructive shadow-soft backdrop-blur-sm transition hover:bg-destructive hover:text-white"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>

                <Link to={`/products/${product._id}`} className="block">
                  <div className="aspect-square bg-muted p-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {product.category}
                  </p>
                  <Link to={`/products/${product._id}`}>
                    <p className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground hover:text-primary">
                      {product.name}
                    </p>
                  </Link>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <p className="text-sm font-bold text-foreground">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{Number(product.mrp).toLocaleString("en-IN")}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="text-xs font-medium text-success">
                        {discountPercent}% off
                      </span>
                    )}
                  </div>

                  {outOfStock ? (
                    <p className="mt-1 text-xs font-medium text-destructive">Out of stock</p>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isMutating}
                      onClick={() => handleMoveToCart(product._id)}
                      className="mt-2 gap-1.5"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Move to Cart
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}