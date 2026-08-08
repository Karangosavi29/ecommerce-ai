import { useState, FormEvent } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { aiSearch, AISearchFilters } from "@/api/ai.api";
import ProductCard from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

const EXAMPLE_QUERIES = [
  "Black sneakers under ₹5000",
  "Office laptop bag below 3000",
  "Phone with good camera under 40000",
  "Comfortable running shoes for daily workout",
];

const AISearchBar = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Product[] | null>(null);
  const [filters, setFilters] = useState<AISearchFilters | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiSearch(q);
      setResults(res.products);
      setFilters(res.filters);
    } catch (err) {
      setError(
        "Couldn't process that search right now. Please try again or use regular search."
      );
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const clear = () => {
    setQuery("");
    setResults(null);
    setFilters(null);
    setError(null);
  };

  const activeFilterEntries = filters
    ? Object.entries(filters).filter(
        ([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
      )
    : [];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: Black sneakers under ₹5000"
            className="pl-10 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          <Search className="h-4 w-4" />
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {!results && !loading && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                runSearch(ex);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {!loading && results && (
        <div className="mt-6">
          {activeFilterEntries.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Understood as:</span>
              {activeFilterEntries.map(([key, value]) => (
                <span key={key} className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                  {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
                </span>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No products matched that search. Try broadening your query.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearchBar;