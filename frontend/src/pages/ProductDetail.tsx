import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Minus, Plus, ChevronRight, Star, ShoppingCart, Zap } from "lucide-react";
import { getProductById, getProducts } from "@/api/products.api";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import { useAuth } from "@/hooks/useAuth";
import { recordProductView } from "@/hooks/useRecentlyViewed";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ShareWishlistBar } from "@/components/product/ShareWishlistBar";
import { DeliveryEstimate } from "@/components/product/DeliveryEstimate";
import { PaymentOptionsPanel } from "@/components/product/PaymentOptionsPanel";
import { FinancingOptions } from "@/components/product/FinancingOptions";
import { WhyBuyFromUs } from "@/components/product/WhyBuyFromUs";
import { WarrantyInfo } from "@/components/product/WarrantyInfo";
import { ProductKeyDetails } from "@/components/product/ProductKeyDetails";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { ProductRail } from "@/components/home/ProductRail";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((state) => state.addItem);
  const isMutating = useCartStore((state) => state.isMutating);

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const [similar, setSimilar] = useState<Product[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const isWishlisted = useWishlistStore((s) => (product ? s.has(product._id) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);

    getProductById(id)
      .then((res) => {
        const p = res.data.product ?? res.data;
        setProduct(p);
        setQuantity(1);
        recordProductView(p._id);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.category) return;
    setSimilarLoading(true);
    getProducts({ category: product.category })
      .then((res) => {
        const list: Product[] = res.data.products ?? res.data ?? [];
        setSimilar(list.filter((p) => p._id !== product._id).slice(0, 8));
      })
      .catch(() => setSimilar([]))
      .finally(() => setSimilarLoading(false));
  }, [product?.category, product?._id]);

  const requireAuthOrRedirect = () => {
    if (isAuthenticated) return true;
    toast.error("Please log in to continue");
    navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
    return false;
  };

  const handleAddToCart = async () => {
    if (!requireAuthOrRedirect() || !product) return;
    await addItem(product._id, quantity);
  };

  const handleBuyNow = async () => {
    if (!requireAuthOrRedirect() || !product) return;
    setIsBuyingNow(true);
    const ok = await addItem(product._id, quantity);
    setIsBuyingNow(false);
    if (ok) navigate("/checkout");
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product._id);
  };

  if (isLoading) return <Spinner fullScreen />;

  if (notFound || !product) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-10">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to shop
        </Button>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const hasRating = typeof product.ratings === "number" && product.ratings > 0;
  const hasDiscount = !!product.mrp && product.mrp > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100)
    : 0;
  const savings = hasDiscount ? product.mrp! - product.price : 0;

  return (
    <div className="container py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/?category=${product.category}`} className="capitalize hover:text-foreground">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="md:flex md:h-[calc(100vh-9rem)] md:items-start md:gap-8">
        <div className="md:w-[42%] md:shrink-0">
          <ShareWishlistBar
            productName={product.name}
            isWishlisted={isWishlisted}
            onToggleWishlist={handleWishlist}
          />
          <div className="mt-2">
            <ImageGallery product={product} />
          </div>
        </div>

        <div className="thin-scrollbar mt-6 md:mt-0 md:h-full md:flex-1 md:overflow-y-auto md:pr-2">
          <div className="flex flex-col gap-4 pb-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {product.category}
              </p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{product.name}</h1>
            </div>

            {hasRating && (
              <div className="flex items-center gap-1.5" aria-label={`Rated ${product.ratings} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(product.ratings as number)
                        ? "fill-warning text-warning"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
                <span className="text-sm font-medium text-muted-foreground">
                  {(product.ratings as number).toFixed(1)}
                </span>
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                {hasDiscount && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      ₹{product.mrp!.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              {hasDiscount && (
                <p className="mt-1 text-sm font-medium text-success">
                  You save ₹{savings.toLocaleString("en-IN")}
                </p>
              )}
            </div>

            <p className="text-sm">
              {outOfStock ? (
                <span className="font-semibold text-destructive">Out of stock</span>
              ) : (
                <span className="font-semibold text-success">
                  In stock ({product.stock} available)
                </span>
              )}
            </p>

            {!outOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center rounded-md border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Buy Now + Add to Cart */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="lg"
                disabled={outOfStock || isBuyingNow}
                onClick={handleBuyNow}
                className="flex-1 gap-1.5"
              >
                <Zap className="h-4 w-4" />
                {isBuyingNow ? "Processing..." : "Buy Now"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={outOfStock || isMutating}
                onClick={handleAddToCart}
                className="flex-1 gap-1.5"
              >
                <ShoppingCart className="h-4 w-4" />
                {isMutating ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            <DeliveryEstimate />

            {/* EMI info */}
            <PaymentOptionsPanel productName={product.name} price={product.price} />
            <FinancingOptions />

            {/* Description / features / specs — single honest section */}
            <ProductKeyDetails description={product.description} />

            <WarrantyInfo />
            <WhyBuyFromUs />

            {/* Customer Reviews — inside the scrollable panel per spec */}
            <ReviewsSection productId={product._id} />
          </div>
        </div>
      </div>

      {/* Similar Products — outside the fixed-height block, normal page scroll */}
      {(similar.length > 0 || similarLoading) && (
        <div className="mt-10 border-t border-border">
          <ProductRail title="Similar Products" products={similar} isLoading={similarLoading} />
        </div>
      )}
    </div>
  );
}