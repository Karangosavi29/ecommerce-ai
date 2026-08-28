import { motion } from "framer-motion";
import { PLACEHOLDER_BRANDS } from "@/components/home/placeholderData";

export function TopBrands() {
  return (
    <section className="border-y border-border bg-card/50 py-10 sm:py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Trusted names
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Trusted Brands
          </h2>
        </motion.div>

        {/* Clean typography tiles — no placeholder logos. Mobile: horizontal scroll. sm+: grid. */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-6 sm:overflow-visible sm:pb-0 sm:snap-none">
          {PLACEHOLDER_BRANDS.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="flex w-28 shrink-0 snap-start items-center justify-center rounded-xl border border-border bg-card px-4 py-5 shadow-soft transition-all hover:border-primary/30 hover:shadow-soft-lg sm:w-auto sm:shrink"
            >
              <span className="text-sm font-bold uppercase tracking-wide text-foreground">
                {brand.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}