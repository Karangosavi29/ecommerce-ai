import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Search, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { getProducts } from "@/api/products.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product, ApiErrorResponse } from "@/types";

interface ProductPickerProps {
  selected: Product[];
  onChange: (products: Product[]) => void;
  maxItems?: number;
}

export function ProductPicker({ selected, onChange, maxItems = 20 }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    getProducts({ search: q })
      .then((res) => setResults(res.data.products ?? res.data ?? []))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = window.setTimeout(() => search(query), 300);
    return () => window.clearTimeout(timer);
  }, [query, search]);

  const isSelected = (id: string) => selected.some((p) => p._id === id);

  const addProduct = (product: Product) => {
    if (isSelected(product._id) || selected.length >= maxItems) return;
    onChange([...selected, product]);
  };

  const removeProduct = (id: string) => {
    onChange(selected.filter((p) => p._id !== id));
  };

  const moveProduct = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selected.length) return;
    const next = [...selected];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products to add..."
          className="pl-9"
        />
      </div>

      {query.trim() && (
        <div className="max-h-56 overflow-y-auto rounded-md border border-border">
          {isSearching ? (
            <p className="p-3 text-sm text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">No products found.</p>
          ) : (
            results.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between gap-3 border-b border-border p-2.5 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSelected(product._id) || selected.length >= maxItems}
                  onClick={() => addProduct(product)}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isSelected(product._id) ? "Added" : "Add"}
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected list, reorderable */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Selected ({selected.length}/{maxItems})
        </p>
        {selected.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No products selected yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {selected.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center gap-2.5 rounded-md border border-border bg-card p-2.5"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => moveProduct(index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === selected.length - 1}
                    onClick={() => moveProduct(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(product._id)}
                    aria-label="Remove"
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}