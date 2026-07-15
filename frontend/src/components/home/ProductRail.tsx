import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import type { Product } from "@/types";

interface ProductRailProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** Extra element rendered on the right of the heading, e.g. a countdown */
  headerAccessory?: React.ReactNode;
}

function CardSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="skeleton aspect-square w-full" />
      <div className="flex flex-col gap-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-4/5 rounded-full" />
        <div className="skeleton mt-2 h-5 w-1/2 rounded-full" />
        <div className="skeleton mt-2 h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

export function ProductRail({
  eyebrow,
  title,
  subtitle,
  products,
  isLoading = false,
  emptyMessage = "Nothing here yet.",
  headerAccessory,
}: ProductRailProps) {
  return (
    <section className="py-10 sm:py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            {eyebrow && (
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </p>
            )}
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
          </div>
          {headerAccessory}
        </motion.div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[220px] shrink-0 snap-start sm:w-[240px] lg:w-[260px]"
              >
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[220px] shrink-0 snap-start sm:w-[240px] lg:w-[260px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Small "View all" link used next to a few rail headings */
export function ViewAllLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex w-fit items-center gap-1.5 rounded-full py-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
    >
      View all
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}