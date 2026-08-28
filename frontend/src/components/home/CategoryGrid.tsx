import { motion } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Cable,
  LayoutGrid,
  Package,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  isLoading?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  mobiles: Smartphone,
  mobile: Smartphone,
  phones: Smartphone,
  smartphones: Smartphone,
  laptops: Laptop,
  laptop: Laptop,
  computers: Laptop,
  audio: Headphones,
  headphones: Headphones,
  speakers: Headphones,
  tv: Tv,
  tvappliances: Tv,
  television: Tv,
  appliances: Tv,
  accessories: Cable,
  accessory: Cable,
};

function iconFor(category: string): LucideIcon {
  const key = category.toLowerCase().replace(/[^a-z]/g, "");
  return ICON_MAP[key] ?? Package;
}

export function CategoryGrid({
  categories,
  activeCategory,
  onSelect,
  isLoading,
}: CategoryGridProps) {
  const items = ["all", ...categories];

  return (
    <section id="categories" className="bg-background py-8">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Explore
          </p>
          <h2 className="text-2xl font-bold">Shop by Category</h2>
        </motion.div>

        {isLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 w-[124px] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar sm:gap-4">
            {items.map((cat) => {
              const Icon = cat === "all" ? LayoutGrid : iconFor(cat);
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelect(cat)}
                  aria-pressed={isActive}
                  className={cn(
                    "group flex w-[124px] shrink-0 flex-col items-center gap-3 rounded-2xl border bg-card p-4 text-center transition-all",
                    "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft",
                    isActive ? "border-primary bg-primary/5 shadow-soft" : "border-border"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="line-clamp-1 text-sm font-semibold capitalize text-foreground">
                    {cat === "all" ? "All Products" : cat}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}