import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Minus, Plus } from "lucide-react";
import { getProductById } from "@/api/products.api";
import useCartStore from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((state) => state.addItem);
  const isMutating = useCartStore((state) => state.isMutating);

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);

    getProductById(id)
      .then((res) => {
        setProduct(res.data.product ?? res.data);
        setActiveImage(0);
        setQuantity(1);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart");
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (!product) return;
    await addItem(product._id, quantity);
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

  const images = product.images?.length ? product.images : [];
  const outOfStock = product.stock <= 0;

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
                    idx === activeImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
            <h1 className="text-2xl font-bold">{product.name}</h1>
          </div>

          <p className="text-3xl font-semibold">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {product.description}
          </p>

          <p className="text-sm">
            {outOfStock ? (
              <span className="font-medium text-destructive">Out of stock</span>
            ) : (
              <span className="font-medium text-green-600">
                In stock ({product.stock} available)
              </span>
            )}
          </p>

          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            size="lg"
            disabled={outOfStock || isMutating}
            onClick={handleAddToCart}
            className="w-full sm:w-auto"
          >
            {isMutating ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}