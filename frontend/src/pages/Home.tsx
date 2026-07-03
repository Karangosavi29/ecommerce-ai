import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { getProducts, getCategories } from "@/api/products.api";
import ProductCard from "@/components/shared/ProductCard";
import Spinner from "@/components/shared/Spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories once
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.categories ?? res.data))
      .catch(() => {
        // non-critical — filter bar just won't show categories
      });
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProducts({
        search: search || undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
      });
      setProducts(res.data.products ?? res.data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Shop GIRIElectronics</h1>

        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm gap-2">
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" size="icon" variant="outline" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => setActiveCategory("all")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <Spinner fullScreen />
      ) : products.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}