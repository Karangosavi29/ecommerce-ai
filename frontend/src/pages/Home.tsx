import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  X,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";

import { getProducts, getCategories } from "@/api/products.api";
import {
  getAllHomeSections,
  type HomeSectionKey,
} from "@/api/homeSections.api";

import ProductCard from "@/components/shared/ProductCard";
import Spinner from "@/components/shared/Spinner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/home/ProductRail";
import { FlashSaleCountdown } from "@/components/home/FlashSaleCountdown";
import { TopBrands } from "@/components/home/TopBrands";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { Newsletter } from "@/components/home/Newsletter";
import { AIFinderBanner } from "@/components/home/AIFinderBanner";

import { WhyBuyFromUs } from "@/components/product/WhyBuyFromUs";

import { useRecentlyViewedIds } from "@/hooks/useRecentlyViewed";

import type { Product } from "@/types";

export default function Home() {
  const [curatedSections, setCuratedSections] = useState<
    Record<HomeSectionKey, Product[]>
  >({
    flashSale: [],
    featured: [],
    bestSellers: [],
  });
  const [isSectionsLoading, setIsSectionsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const shopGridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    getAllHomeSections()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];

        const next: Record<HomeSectionKey, Product[]> = {
          flashSale: [],
          featured: [],
          bestSellers: [],
        };

        for (const section of data as {
          key: HomeSectionKey;
          productIds: Product[];
        }[]) {
          next[section.key] = section.productIds ?? [];
        }

        setCuratedSections(next);
      })
      .catch(() => {
      })
      .finally(() => {
        setIsSectionsLoading(false);
      });
  }, []);


  useEffect(() => {
    getProducts({})
      .then((res) => {
        setAllProducts(res.data.products ?? res.data ?? []);
      })
      .catch(() => {
        // Catalog request failure is handled by individual sections.
      })
      .finally(() => {
        setIsCatalogLoading(false);
      });
  }, []);


  useEffect(() => {
    getCategories()
      .then((res) => {
        setCategories(res.data.categories ?? res.data ?? []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    const urlCategory = searchParams.get("category") ?? "all";

    setSearch(urlSearch);
    setSearchInput(urlSearch);
    setActiveCategory(urlCategory);

    if (urlSearch || urlCategory !== "all") {
      window.setTimeout(() => {
        shopGridRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProducts({
        search: search || undefined,
        category:
          activeCategory !== "all" ? activeCategory : undefined,
      });

      setProducts(res.data.products ?? res.data ?? []);
    } catch {
      toast.error("Failed to load products");
      setProducts([]);
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

    window.setTimeout(() => {
      shopGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);

    window.setTimeout(() => {
      shopGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };
  const scrollToShop = useCallback(() => {
    shopGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const newArrivals = useMemo(() => {
    const withDates = allProducts.filter(
      (product: any) => product.createdAt
    );

    const sorted =
      withDates.length > 0
        ? [...withDates].sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        : [...allProducts].reverse();

    return sorted.slice(0, 8);
  }, [allProducts]);

  const recentlyViewedIds = useRecentlyViewedIds();

  const recentlyViewed = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => allProducts.find((product) => product._id === id))
        .filter((product): product is Product => Boolean(product)),
    [recentlyViewedIds, allProducts]
  );


  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setActiveCategory("all");

    window.setTimeout(() => {
      shopGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const hasActiveFilters =
    Boolean(search) || activeCategory !== "all";

  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />
      <CategoryGrid
        categories={categories}
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
        isLoading={categories.length === 0 && isLoading}
      />

      <div className="border-t border-border" />

      <ProductRail
        eyebrow="Ends tonight"
        title="Flash Sale"
        subtitle="Today's picks — refreshed daily."
        products={curatedSections.flashSale}
        isLoading={isSectionsLoading}
        headerAccessory={<FlashSaleCountdown />}
        emptyMessage="No deals right now — check back soon."
        onViewAll={scrollToShop}
      />

      <AIFinderBanner />

      <div className="border-t border-border bg-card/40">
        <ProductRail
          eyebrow="Handpicked"
          title="Featured Products"
          products={curatedSections.featured}
          isLoading={isSectionsLoading}
          emptyMessage="Nothing featured yet — check back soon."
          onViewAll={scrollToShop}
        />
      </div>

      <TopBrands />

      <section className="border-t border-border py-10 sm:py-12">
        <div className="container">
          <div className="mb-6 text-center sm:mb-8">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Our Promise
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Why Shop With GIRI Electronics?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Buy from people you can come back to.
            </p>
          </div>
          <WhyBuyFromUs size="lg" />
        </div>
      </section>

      <ProductRail
        eyebrow="Popular"
        title="Best Sellers"
        products={curatedSections.bestSellers}
        isLoading={isSectionsLoading}
        emptyMessage="No best sellers picked yet — check back soon."
        onViewAll={scrollToShop}
      />

      <div className="border-t border-border bg-card/40">
        <ProductRail
          eyebrow="Just in"
          title="New Arrivals"
          products={newArrivals}
          isLoading={isCatalogLoading}
        />
      </div>

      {recentlyViewed.length > 0 && (
        <ProductRail
          eyebrow="Continue browsing"
          title="Recently Viewed"
          products={recentlyViewed}
        />
      )}

      <CustomerReviews />

      <section
        id="shop"
        ref={shopGridRef}
        className="scroll-mt-20 border-t border-border py-12 sm:py-16"
      >
        <div className="container">
          <div className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Full catalog
                  </p>
                </div>

                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Shop All Products
                </h2>

                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Browse everything available in our store or search for
                  exactly what you need.
                </p>
              </div>

              {/* Search */}
              <form
                onSubmit={handleSearchSubmit}
                className="w-full lg:w-[380px]"
              >
                <div className="group relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />

                  <Input
                    ref={searchInputRef}
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="Search products"
                    className="h-11 rounded-xl border-border bg-card pl-10 pr-10 shadow-sm transition focus-visible:border-primary/40 focus-visible:ring-primary/10"
                  />

                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setSearch("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Active filters:
              </div>

              {search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  Search: "{search}"
                </span>
              )}

              {activeCategory !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium capitalize text-primary">
                  {activeCategory}
                </span>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <Button
                  size="sm"
                  variant={
                    activeCategory === "all"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setActiveCategory("all")}
                  className="shrink-0 rounded-full px-4"
                >
                  All products
                </Button>

                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={
                      activeCategory === cat
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setActiveCategory(cat)}
                    className="shrink-0 rounded-full px-4 capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Result count */}
          {!isLoading && products.length > 0 && (
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {products.length}
                </span>{" "}
                {products.length === 1 ? "product" : "products"} found
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="hidden items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary sm:flex"
                >
                  Back to top
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                {search
                  ? `No results for "${search}"`
                  : "No products found"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {search
                  ? 'Try a different keyword, or ask our AI assistant. It understands requests like "laptops under ₹30,000".'
                  : "Try changing your category or check back soon."}
              </p>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="rounded-full"
                  >
                    Clear filters
                  </Button>
                )}

                <Button
                  onClick={() => {
                    // FloatingAIProductAssistant is `fixed`-position, so scrolling to its
                    // wrapper has no visible effect — open it directly instead.
                    window.dispatchEvent(new CustomEvent("open-ai-assistant"));
                  }}
                  className="rounded-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ask AI Assistant
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Product grid */}
              <div className="h-[650px] overflow-y-auto overflow-x-hidden rounded-2xl pr-2 thin-scrollbar">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <div key={product._id} className="group min-w-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>


              <div className="mt-8 flex items-center justify-center">
                <p className="rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] text-muted-foreground">
                  Showing {products.length}{" "}
                  {products.length === 1 ? "product" : "products"}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}