import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  isLoading?: boolean;
}

const GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-sky-400 to-blue-600",
  "from-indigo-400 to-blue-600",
  "from-cyan-400 to-blue-600",
  "from-blue-600 to-indigo-700",
];

function gradientFor(name: string) {
  const hash = name
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return GRADIENTS[hash % GRADIENTS.length];
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

          <h2 className="text-2xl font-bold">
            Shop by Category
          </h2>
        </motion.div>


        {isLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 w-32 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {items.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelect(cat)}
                className={cn(
                  "group flex w-[135px] shrink-0 flex-col items-center gap-3 rounded-2xl border bg-card p-3 transition-all",
                  "hover:-translate-y-1 hover:border-primary/40 hover:shadow-md",
                  activeCategory === cat
                    ? "border-primary shadow-md shadow-primary/10"
                    : "border-border"
                )}
              >
                <div
                  className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-xl",
                    "bg-gradient-to-br shadow-inner",
                    cat === "all"
                      ? "from-slate-700 to-slate-900"
                      : gradientFor(cat)
                  )}
                >
                  <span className="text-2xl font-bold text-white">
                    {cat === "all"
                      ? "ALL"
                      : cat.charAt(0).toUpperCase()}
                  </span>
                </div>

                <span className="line-clamp-1 text-center text-sm font-semibold capitalize text-foreground">
                  {cat === "all" ? "All Products" : cat}
                </span>
              </button>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}