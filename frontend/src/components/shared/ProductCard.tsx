import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = Array.isArray(product.images) ? product.images[0] : undefined;
  const stock = typeof product.stock === "number" ? product.stock : Number(product.stock) || 0;
  const price = typeof product.price === "number" ? product.price : Number(product.price) || 0;
  const outOfStock = stock <= 0;

  return (
    <Card className="flex flex-col overflow-hidden">
      <Link to={`/products/${product._id}`} className="aspect-square w-full overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <Link to={`/products/${product._id}`}>
          <h3 className="line-clamp-2 text-sm font-medium hover:underline">{product.name}</h3>
        </Link>
        <p className="mt-1 text-base font-semibold">₹{price.toLocaleString("en-IN")}</p>
        {outOfStock && <p className="text-xs font-medium text-destructive">Out of stock</p>}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/products/${product._id}`} className="w-full">
          <Button className="w-full" variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}