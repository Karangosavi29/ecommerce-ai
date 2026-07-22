import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useWishlistStore from "@/store/wishlistStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";


interface EnrichedProduct extends Product {
  brand?: string;
}

interface ProductCardProps {
  product: EnrichedProduct;
  onQuickView?: (product: EnrichedProduct) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { _id, name, category, imageUrl, brand, mrp, ratings } = product;
  const stock = typeof product.stock === "number" ? product.stock : Number(product.stock) || 0;
  const price = typeof product.price === "number" ? product.price : Number(product.price) || 0;
  const outOfStock = stock <= 0;
  const hasDiscount = !!mrp && mrp > price;
  const discountPercent = hasDiscount ? Math.round(((mrp! - price) / mrp!) * 100) : 0;

  const isWishlisted = useWishlistStore((s) => s.has(_id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(_id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden rounded-lg border-border shadow-soft transition-shadow duration-300 hover:shadow-soft-lg">
        <Link
          to={`/products/${_id}`}
          className="flex h-full flex-col focus:outline-none"
          aria-label={`View details for ${name}`}
        >
          {/* Image zone */}
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            {hasDiscount && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground shadow-sm">
                {discountPercent}% OFF
              </span>
            )}

            <button
              type="button"
              onClick={handleWishlist}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full",
                "bg-white/90 shadow-soft backdrop-blur transition-transform hover:scale-110 active:scale-95",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
                )}
              />
            </button>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}

            {/* Quick View: slides up on hover (desktop); pinned visible on touch */}
            <div
              className={cn(
                "absolute inset-x-3 bottom-3 z-10 translate-y-2 opacity-0 transition-all duration-300",
                "group-hover:translate-y-0 group-hover:opacity-100",
                "max-md:translate-y-0 max-md:opacity-100"
              )}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleQuickView}
                className="w-full gap-1.5 rounded-md bg-white/95 shadow-soft backdrop-blur hover:bg-white"
              >
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </Button>
            </div>

            {outOfStock && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
                  Out of stock
                </span>
              </div>
            )}
          </div>

          {/* Content zone */}
          <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {brand ?? category}
            </p>
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">
              {name}
            </h3>

            {typeof ratings === "number" && (
              <div className="flex items-center gap-0.5" aria-label={`Rated ${ratings.toFixed(1)} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.round(ratings) ? "fill-warning text-warning" : "fill-muted text-muted"
                    )}
                  />
                ))}
                <span className="ml-1 text-xs font-medium text-muted-foreground">{ratings.toFixed(1)}</span>
              </div>
            )}

            <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{mrp!.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold text-success">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}